import type { Metadata } from "next";
import {
  LegalBlock,
  LegalPageShell,
  LegalSection,
  legalMetadata,
} from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy | Suan Bai Spa",
  description:
    "นโยบายความเป็นส่วนตัวของ Suan Bai Spa — การเก็บและใช้ข้อมูลส่วนบุคคลสำหรับการจองคิวและบริการสปา",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell
      titleTh="นโยบายความเป็นส่วนตัว"
      titleEn="Privacy Policy"
    >
      <LegalSection titleTh="บทนำ" titleEn="Introduction">
        <LegalBlock lang="th">
          <p>
            {legalMetadata.site} (&quot;เรา&quot;) ให้บริการจองคิวนวดและสปาผ่านเว็บไซต์
            นโยบายนี้อธิบายว่าเราเก็บ ใช้ และปกป้องข้อมูลส่วนบุคคลของคุณ
            เมื่อใช้บริการของเรา รวมถึงการเข้าสู่ระบบผ่าน LINE (LIFF / LINE Login)
            หากมีการเปิดใช้งาน
          </p>
        </LegalBlock>
        <LegalBlock lang="en">
          <p>
            {legalMetadata.site} (&quot;we&quot;, &quot;us&quot;) provides massage and spa
            queue booking through our website. This policy explains how we collect,
            use, and protect your personal data, including when you sign in via LINE
            (LIFF / LINE Login), if enabled.
          </p>
        </LegalBlock>
      </LegalSection>

      <LegalSection titleTh="ข้อมูลที่เราเก็บ" titleEn="Data we collect">
        <LegalBlock lang="th">
          <ul>
            <li>ชื่อ-นามสกุล และเบอร์โทรศัพท์ (สำหรับยืนยันและติดต่อการจอง)</li>
            <li>รายละเอียดการจอง (บริการ วัน เวลา จำนวนผู้ใช้บริการ หมายเหตุ)</li>
            <li>หมายเลขคิว (queue number) และสถานะการจอง</li>
            <li>
              ข้อมูล LINE (เช่น User ID, ชื่อที่แสดงใน LINE) หากคุณเข้าสู่ระบบหรือใช้
              LIFF
            </li>
            <li>ข้อมูลทางเทคนิค (เช่น ประเภทเบราว์เซอร์, วันที่เข้าใช้) ในระดับที่จำเป็น</li>
          </ul>
        </LegalBlock>
        <LegalBlock lang="en">
          <ul>
            <li>Name and phone number (for booking confirmation and contact)</li>
            <li>Booking details (services, date, time, party size, notes)</li>
            <li>Queue number and booking status</li>
            <li>LINE data (e.g. User ID, display name) if you use LINE Login or LIFF</li>
            <li>Technical data (e.g. browser type, access dates) as reasonably needed</li>
          </ul>
        </LegalBlock>
      </LegalSection>

      <LegalSection titleTh="วัตถุประสงค์" titleEn="How we use your data">
        <LegalBlock lang="th">
          <ul>
            <li>รับและยืนยันการจองคิว</li>
            <li>ติดต่อคุณเกี่ยวกับการจอง (รวมถึงผ่าน LINE หากคุณยินยอม)</li>
            <li>ให้คุณตรวจสอบสถานะคิว</li>
            <li>ปรับปรุงบริการและความปลอดภัยของระบบ</li>
            <li>ปฏิบัติตามกฎหมายที่เกี่ยวข้อง</li>
          </ul>
        </LegalBlock>
        <LegalBlock lang="en">
          <ul>
            <li>Process and confirm queue bookings</li>
            <li>Contact you about your booking (including via LINE, if applicable)</li>
            <li>Let you check queue status</li>
            <li>Improve our services and system security</li>
            <li>Comply with applicable laws</li>
          </ul>
        </LegalBlock>
      </LegalSection>

      <LegalSection titleTh="การเก็บและแชร์ข้อมูล" titleEn="Storage and sharing">
        <LegalBlock lang="th">
          <p>
            ข้อมูลการจองถูกเก็บในฐานข้อมูลที่ปลอดภัย (PostgreSQL บน Neon)
            เราไม่ขายข้อมูลส่วนบุคคลของคุณ เราอาจแชร์ข้อมูลเฉพาะที่จำเป็นกับ:
          </p>
          <ul>
            <li>ผู้ให้บริการโฮสติ้งและฐานข้อมูล (เช่น Neon, Vercel)</li>
            <li>LINE Corporation หากคุณใช้บริการ LINE Login / Messaging API</li>
            <li>หน่วยงานที่มีอำนาจตามกฎหมาย เมื่อมีข้อกำหนด</li>
          </ul>
        </LegalBlock>
        <LegalBlock lang="en">
          <p>
            Booking data is stored in a secure database (PostgreSQL on Neon).
            We do not sell your personal data. We may share only what is necessary with:
          </p>
          <ul>
            <li>Hosting and database providers (e.g. Neon, Vercel)</li>
            <li>LINE Corporation if you use LINE Login or Messaging API</li>
            <li>Authorities when required by law</li>
          </ul>
        </LegalBlock>
      </LegalSection>

      <LegalSection titleTh="ระยะเวลาเก็บข้อมูล" titleEn="Retention">
        <LegalBlock lang="th">
          <p>
            เราเก็บข้อมูลการจองตามระยะเวลาที่จำเป็นสำหรับการให้บริการ บัญชี และ
            ข้อกำหนดทางกฎหมาย หลังจากนั้นเราจะลบหรือทำให้ไม่สามารถระบุตัวตนได้
          </p>
        </LegalBlock>
        <LegalBlock lang="en">
          <p>
            We retain booking data for as long as needed to provide the service,
            maintain records, and meet legal requirements, then delete or anonymize it.
          </p>
        </LegalBlock>
      </LegalSection>

      <LegalSection titleTh="สิทธิของคุณ" titleEn="Your rights">
        <LegalBlock lang="th">
          <p>
            คุณมีสิทธิขอเข้าถึง แก้ไข หรือลบข้อมูลส่วนบุคคลของคุณ โดยติดต่อเราที่{" "}
            <a href={`mailto:${legalMetadata.email}`}>{legalMetadata.email}</a>{" "}
            หรือผ่าน LINE Official Account ของร้าน
          </p>
        </LegalBlock>
        <LegalBlock lang="en">
          <p>
            You may request access, correction, or deletion of your personal data by
            contacting us at{" "}
            <a href={`mailto:${legalMetadata.email}`}>{legalMetadata.email}</a> or via
            our LINE Official Account.
          </p>
        </LegalBlock>
      </LegalSection>

      <LegalSection titleTh="ติดต่อเรา" titleEn="Contact">
        <LegalBlock lang="th">
          <p>
            {legalMetadata.site}
            <br />
            อีเมล:{" "}
            <a href={`mailto:${legalMetadata.email}`}>{legalMetadata.email}</a>
            <br />
            123 ถนนสุขุมวิท กรุงเทพฯ 10110
          </p>
        </LegalBlock>
        <LegalBlock lang="en">
          <p>
            {legalMetadata.site}
            <br />
            Email:{" "}
            <a href={`mailto:${legalMetadata.email}`}>{legalMetadata.email}</a>
            <br />
            123 Sukhumvit Rd, Bangkok 10110, Thailand
          </p>
        </LegalBlock>
      </LegalSection>
    </LegalPageShell>
  );
}
