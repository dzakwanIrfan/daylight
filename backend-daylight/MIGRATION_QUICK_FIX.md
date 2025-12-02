# Quick Fix - Partner CityId Migration Error

## TL;DR - Langkah Cepat

```bash
# Di server production
cd ~/daylight/backend-daylight

# Pull perubahan terbaru
git pull origin main

# Jalankan script fix (otomatis)
bash prisma/fix-migration.sh
```

**Itu saja!** Script akan otomatis:
1. ✅ Mark failed migration sebagai rolled back
2. ✅ Deploy migration yang sudah diperbaiki
3. ✅ Generate Prisma Client
4. ✅ Migrate event cities (Tangerang & Banten → Jakarta)
5. ✅ Migrate partner cities
6. ✅ Verifikasi semua data

---

## Manual Steps (Jika Script Gagal)

### 1. Mark Migration Rolled Back
```bash
psql -d daylight -c "UPDATE _prisma_migrations SET rolled_back_at = NOW(), finished_at = NOW() WHERE migration_name = '20251201133342_add_city_partner';"
```

### 2. Deploy Fixed Migration
```bash
pnpm prisma migrate deploy
pnpm prisma generate
```

### 3. Migrate Data
```bash
pnpm ts-node prisma/migrate-city-data.ts
pnpm ts-node prisma/migrate-partner-cities-fix.ts
```

### 4. Verify
```bash
psql -d daylight -c "SELECT COUNT(*) FROM \"Partner\" WHERE \"cityId\" IS NULL;"
```

Should return `0`.

---

## Apa yang Berubah?

1. **Migration File Updated**: `cityId` dibuat nullable dulu
2. **City Mappings Added**:
   - Tangerang → Jakarta
   - Banten → Jakarta
3. **New Script**: `migrate-partner-cities-fix.ts`
4. **Schema Updated**: `Partner.cityId` sekarang optional (`String?`)

---

## Setelah Fix

1. **Restart Backend**:
   ```bash
   pm2 restart backend-daylight
   # atau sesuai deployment Anda
   ```

2. **Optional - Make CityId Required**:
   ```bash
   # Hanya jika SEMUA partner sudah punya cityId
   pnpm prisma migrate deploy
   ```

---

## Troubleshooting

### Migration Masih Error?
```bash
# Cek status migrations
pnpm prisma migrate status

# Cek _prisma_migrations table
psql -d daylight -c "SELECT migration_name, finished_at, rolled_back_at FROM _prisma_migrations ORDER BY started_at DESC LIMIT 5;"
```

### Partner Masih Null CityId?
```bash
# Lihat partner mana yang masih null
psql -d daylight -c "SELECT id, name, city FROM \"Partner\" WHERE \"cityId\" IS NULL;"

# Set manual (ganti ID dan CITY_ID)
psql -d daylight -c "UPDATE \"Partner\" SET \"cityId\" = 'CITY_ID' WHERE id = 'PARTNER_ID';"
```

### Rollback Semua?
```bash
bash prisma/fix-migration.sh rollback
```

---

## Need Help?

Lihat dokumentasi lengkap: `MIGRATION_FIX_GUIDE.md`
