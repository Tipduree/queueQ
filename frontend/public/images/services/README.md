# รูปบริการ (catalog + carousel)

| ไฟล์ที่แก้ | ทำอะไร |
|-----------|--------|
| **`frontend/src/content/service-category-images.json`** | map **slug → path รูป** (ไฟล์หลัก) |
| **`backend/prisma/seed.ts`** | รายการบริการใน catalog (slug, ราคา, nameKey) |
| **`frontend/src/lib/spa/service-carousel-items.ts`** | ลำดับการ์ด carousel หน้าแรก |

Slug ใน JSON ต้องตรงกับ `slug` ใน seed / API `GET /services`:

| Slug | ไฟล์รูป (ตัวอย่าง) |
|------|---------------------|
| `thai-traditional` | `thai-massage.jpg` |
| `aromatherapy` | `aroma-oil.jpg` |
| `foot-massage` | `foot-massage.jpg` |
| `herbal-scrub` | `herbal-srcub.png` |
| `hot-stone` | `hot-stone-massage.jpg` |
| `prenatal` | `pregnant-massage.jpg` |
