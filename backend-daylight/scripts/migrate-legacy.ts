import { PrismaClient, TransactionStatus, PaymentMethodType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting migration...');

    // 1. SEED COUNTRY (Required for PaymentMethod)
    console.log('--- Checking Country Data ---');
    await prisma.country.upsert({
        where: { code: 'ID' },
        update: {},
        create: {
            code: 'ID',
            name: 'Indonesia',
            currency: 'IDR',
            phoneCode: '+62',
        },
    });
    console.log('✅ Country "ID" ensured.');

    // 2. MIGRATE PAYMENT METHODS
    console.log('--- Migrating Legacy Payment Methods ---');
    const legacyMethods = await prisma.legacyPaymentMethod.findMany();

    for (const method of legacyMethods) {
        // Helper untuk mapping kode Tripay ke Type PaymentMethod baru
        let newType: PaymentMethodType = 'ONLINE_BANKING'; // Default
        const codeUpper = method.code.toUpperCase();

        if (codeUpper.includes('VA')) newType = 'BANK_TRANSFER';
        else if (codeUpper.includes('QRIS') || codeUpper.includes('QR')) newType = 'QR_CODE';
        else if (['OVO', 'DANA', 'SHOPEEPAY', 'LINKAJA', 'GOPAY'].some(w => codeUpper.includes(w))) newType = 'EWALLET';
        else if (['ALFAMART', 'INDOMARET'].some(w => codeUpper.includes(w))) newType = 'OVER_THE_COUNTER';
        else if (codeUpper.includes('CARD') || codeUpper.includes('CREDIT')) newType = 'CARDS';

        // Konversi fee
        const adminFeeRate = method.feeCustomerPercent ? method.feeCustomerPercent / 100 : 0;
        const adminFeeFixed = method.feeCustomerFlat || 0;

        await prisma.paymentMethod.upsert({
            where: { code: method.code },
            update: {}, // Biarkan kosong agar tidak menimpa config baru jika sudah ada
            create: {
                code: method.code,
                name: method.name,
                countryCode: 'ID',
                currency: 'IDR',
                minAmount: method.minimumAmount,
                maxAmount: method.maximumAmount,
                type: newType,
                isActive: method.isActive,
                adminFeeRate: adminFeeRate,
                adminFeeFixed: adminFeeFixed,
                logoUrl: method.iconUrl,
            },
        });
    }
    console.log(`✅ Processed ${legacyMethods.length} payment methods.`);

    // 3. MIGRATE TRANSACTIONS
    console.log('--- Migrating Legacy Transactions ---');

    const BATCH_SIZE = 100;
    let skip = 0;
    let hasMore = true;
    let processedCount = 0;

    while (hasMore) {
        const legacyTransactions = await prisma.legacyTransaction.findMany({
            take: BATCH_SIZE,
            skip: skip,
            include: {
                userSubscription: true,
                matchingMember: true,
            },
            orderBy: { createdAt: 'asc' }
        });

        if (legacyTransactions.length === 0) {
            hasMore = false;
            break;
        }

        for (const oldTx of legacyTransactions) {
            // Cek apakah transaksi ini sudah dimigrasikan sebelumnya
            const existingNewTx = await prisma.transaction.findUnique({
                where: { externalId: oldTx.merchantRef }
            });

            if (existingNewTx) {
                await linkRelations(oldTx, existingNewTx.id);
                continue;
            }

            // --- PERBAIKAN DI SINI (Explicit Type Definition) ---
            let paymentMethodId: string | null = null;

            if (oldTx.paymentMethodCode) {
                const pm = await prisma.paymentMethod.findUnique({
                    where: { code: oldTx.paymentMethodCode }
                });
                if (pm) paymentMethodId = pm.id;
            }

            // Map Status
            let newStatus: TransactionStatus = 'PENDING';
            if (oldTx.paymentStatus === 'PAID') newStatus = 'PAID';
            else if (oldTx.paymentStatus === 'FAILED') newStatus = 'FAILED';
            else if (oldTx.paymentStatus === 'EXPIRED') newStatus = 'EXPIRED';
            else if (oldTx.paymentStatus === 'REFUNDED') newStatus = 'REFUNDED';

            // Hitung final amount
            const finalAmt = oldTx.amountReceived > 0 ? oldTx.amountReceived : (oldTx.amount + oldTx.totalFee);

            // Buat Transaksi Baru
            const newTx = await prisma.transaction.create({
                data: {
                    userId: oldTx.userId,
                    eventId: oldTx.eventId,
                    paymentMethodId: paymentMethodId,
                    paymentMethodName: oldTx.paymentName || oldTx.paymentMethodCode || 'Unknown',
                    externalId: oldTx.merchantRef,
                    status: newStatus,
                    amount: oldTx.amount,
                    totalFee: oldTx.totalFee,
                    finalAmount: finalAmt,
                    paymentUrl: oldTx.checkoutUrl || oldTx.payUrl,
                    transactionType: oldTx.transactionType,
                    createdAt: oldTx.createdAt,
                    updatedAt: oldTx.updatedAt,
                }
            });

            // 4. CREATE ACTIONS (Migrasi PayCode / QR String)
            if (oldTx.payCode) {
                await prisma.transactionAction.create({
                    data: {
                        transactionId: newTx.id,
                        type: 'PRESENT_TO_CUSTOMER',
                        descriptor: 'PAYMENT_CODE',
                        value: oldTx.payCode
                    }
                });
            }

            if (oldTx.qrString) {
                await prisma.transactionAction.create({
                    data: {
                        transactionId: newTx.id,
                        type: 'PRESENT_TO_CUSTOMER',
                        descriptor: 'QR_STRING',
                        value: oldTx.qrString
                    }
                });
            }

            // 5. RELINK RELATIONS
            await linkRelations(oldTx, newTx.id);

            process.stdout.write('.');
        }

        skip += legacyTransactions.length;
        processedCount += legacyTransactions.length;
    }

    console.log(`\n✅ Successfully processed ${processedCount} transactions.`);
}

// Fungsi Helper untuk update relasi tabel lain
async function linkRelations(oldTx: any, newTxId: string) {
    if (oldTx.userSubscription) {
        await prisma.userSubscription.update({
            where: { id: oldTx.userSubscription.id },
            data: { transactionId: newTxId }
        });
    }

    if (oldTx.matchingMember) {
        await prisma.matchingMember.update({
            where: { id: oldTx.matchingMember.id },
            data: { transactionId: newTxId }
        });
    }
}

main()
    .catch((e) => {
        console.error('❌ Migration failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });