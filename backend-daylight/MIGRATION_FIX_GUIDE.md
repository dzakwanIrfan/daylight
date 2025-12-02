# Panduan Memperbaiki Migration Error: 20251201133342_add_city_partner

## Masalah
Migration gagal karena mencoba menambahkan kolom `cityId` NOT NULL ke tabel Partner yang sudah ada datanya.

```
Error: P3009
migrate found failed migrations in the target database
The `20251201133342_add_city_partner` migration started at 2025-12-02 13:46:39.608613 UTC failed
```

## Solusi (Safe for Production)

### Langkah 1: Tandai Migration Sebagai Rolled Back

```bash
# SSH ke server production
ssh daylight@server426491378

# Masuk ke direktori backend
cd ~/daylight/backend-daylight

# Tandai migration sebagai rolled back
psql -d daylight -c "UPDATE _prisma_migrations SET rolled_back_at = NOW(), finished_at = NOW() WHERE migration_name = '20251201133342_add_city_partner';"
```

**Output yang diharapkan:**
```
UPDATE 1
```

### Langkah 2: Update Repository dengan Migration yang Sudah Diperbaiki

Migration file `20251201133342_add_city_partner/migration.sql` sudah diupdate untuk membuat `cityId` nullable terlebih dahulu.

```bash
# Di local machine, commit perubahan
git add .
git commit -m "fix: Make partner cityId nullable first, then require after data migration"
git push origin main

# Di server, pull perubahan terbaru
cd ~/daylight/backend-daylight
git pull origin main
```

### Langkah 3: Deploy Migration yang Sudah Diperbaiki

```bash
# Di server
pnpm prisma migrate deploy
```

**Output yang diharapkan:**
```
27 migrations found in prisma/migrations
Applying migration `20251201133342_add_city_partner`
✔ Migration `20251201133342_add_city_partner` applied successfully
```

### Langkah 4: Generate Prisma Client

```bash
pnpm prisma generate
```

### Langkah 5: Update City Mappings untuk Event yang Gagal

Script `migrate-city-data.ts` sudah diupdate dengan mapping:
- Tangerang → Jakarta
- Banten → Jakarta

```bash
# Jalankan ulang migration untuk event
pnpm ts-node prisma/migrate-city-data.ts
```

**Output yang diharapkan:**
```
Events: 6/6 migrated (semua berhasil)
```

### Langkah 6: Migrate Partner Cities

```bash
# Jalankan script untuk migrate partner cities
pnpm ts-node prisma/migrate-partner-cities-fix.ts
```

**Output yang diharapkan:**
```
🤝 Migrating Partner data...
  Found 1 partners to migrate

  ✅ Migrated: [Partner Name] -> jakarta (atau city lain)

📊 Partner Migration Results:
  ✅ Migrated: 1
  ❌ Failed/Unrecognized: 0

🔍 Verification:
  Partners with cityId: 1/1
```

### Langkah 7: Deploy Migration untuk Make cityId Required (OPTIONAL)

**⚠️ PENTING:** Hanya jalankan ini setelah memastikan SEMUA partner sudah punya cityId!

```bash
# Cek dulu apakah semua partner sudah punya cityId
psql -d daylight -c "SELECT COUNT(*) FROM \"Partner\" WHERE \"cityId\" IS NULL;"
```

Jika hasilnya `0`, maka aman untuk melanjutkan:

```bash
# Deploy migration untuk make cityId required
pnpm prisma migrate deploy
```

### Langkah 8: Restart Backend Service

```bash
# Restart backend service (sesuaikan dengan setup Anda)
pm2 restart backend-daylight
# atau
systemctl restart backend-daylight
# atau
# restart sesuai cara deployment Anda
```

## Verifikasi Final

```bash
# Cek status migrations
pnpm prisma migrate status

# Cek data events
psql -d daylight -c "SELECT COUNT(*) as total, COUNT(\"cityId\") as with_city FROM \"Event\";"

# Cek data partners
psql -d daylight -c "SELECT COUNT(*) as total, COUNT(\"cityId\") as with_city FROM \"Partner\";"

# Cek data users
psql -d daylight -c "SELECT COUNT(*) as total, COUNT(\"currentCityId\") as with_city FROM \"User\";"
```

## Expected Results

- ✅ Semua migrations berhasil apply
- ✅ Events: 48/48 dengan cityId
- ✅ Partners: 1/1 dengan cityId
- ✅ Users: 0/112 dengan currentCityId (ini normal, user set sendiri via profile)

## Rollback Plan (Jika Ada Masalah)

Jika terjadi error setelah langkah tertentu:

```bash
# 1. Mark migration sebagai rolled back lagi
psql -d daylight -c "UPDATE _prisma_migrations SET rolled_back_at = NOW() WHERE migration_name = '20251201133342_add_city_partner';"

# 2. Hapus kolom cityId dari Partner (jika sudah ditambahkan)
psql -d daylight -c "ALTER TABLE \"Partner\" DROP COLUMN IF EXISTS \"cityId\";"

# 3. Drop index yang dibuat (jika ada)
psql -d daylight -c "DROP INDEX IF EXISTS \"Partner_cityId_idx\";"

# 4. Drop foreign key constraint (jika ada)
psql -d daylight -c "ALTER TABLE \"Partner\" DROP CONSTRAINT IF EXISTS \"Partner_cityId_fkey\";"

# 5. Restart dan coba lagi dari awal
```

## Notes

1. **City Mappings yang Ditambahkan:**
   - Tangerang → Jakarta
   - Banten → Jakarta

2. **Partner Default City:**
   - Jika partner tidak punya city string, akan di-set ke Jakarta sebagai default

3. **Schema Changes:**
   - `Partner.cityId` pertama dibuat nullable
   - Setelah data dimigrate, bisa di-make required (optional)

4. **Backward Compatibility:**
   - Legacy field `Partner.city` (string) tetap ada
   - Field `Partner.cityId` adalah relasi ke City model yang baru

## Contact

Jika ada masalah atau error yang tidak tercantum di sini, segera hubungi tim development.
