/** Edit this file — copy text from your public Google Maps reviews. */

export type FeaturedGoogleReview = {
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  /** Optional label, e.g. "2 เดือนที่แล้ว" */
  when?: string;
};

/** Update when your Google rating / count changes. */
export const FEATURED_GOOGLE_LISTING = {
  rating: 4.6,
  reviewCount: 275,
};

export const FEATURED_GOOGLE_REVIEWS: FeaturedGoogleReview[] = [
  {
    author: "ลูกค้า Google",
    rating: 5,
    text: "นวดดีมาก บรรยากาศสงบ พนักงานใส่ใจ แนะนำเลยค่ะ",
    when: "ตัวอย่าง — แก้เป็นข้อความจริงจาก Google Maps",
  },
  {
    author: "ลูกค้า Google",
    rating: 5,
    text: "ราคาเหมาะสม นวดแผนไทยแท้ๆ คลายเมื่อยย์ได้ดี",
    when: "ตัวอย่าง",
  },
  {
    author: "ลูกค้า Google",
    rating: 5,
    text: "มาน่านทีไรก็แวะ บริการเป็นกันเอง ประทับใจทุกครั้ง",
    when: "ตัวอย่าง",
  },
];
