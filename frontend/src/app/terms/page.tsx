import type { Metadata } from "next";
import {
  LegalBlock,
  LegalPageShell,
  LegalSection,
  legalMetadata,
} from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Terms of Use | Suan Bai Spa",
  description:
    "ข้อกำหนดการใช้บริการ Suan Bai Spa — กฎการจองคิวนวดและสปาออนไลน์",
};

export default function TermsPage() {
  return (
    <LegalPageShell titleTh="ข้อกำหนดการใช้บริการ" titleEn="Terms of Use">
      <LegalSection titleTh="การยอมรับข้อกำหนด" titleEn="Acceptance">
        <LegalBlock lang="th">
          <p>
            การใช้เว็บไซต์และระบบจองคิวของ {legalMetadata.site} ถือว่าคุณยอมรับ
            ข้อกำหนดนี้และ{" "}
            <a href="/privacy">นโยบายความเป็นส่วนตัว</a> หากไม่ยอมรับ
            กรุณาอย่าใช้บริการ
          </p>
        </LegalBlock>
        <LegalBlock lang="en">
          <p>
            By using the {legalMetadata.site} website and queue booking system, you
            agree to these Terms and our{" "}
            <a href="/privacy">Privacy Policy</a>. If you do not agree, please do not
            use the service.
          </p>
        </LegalBlock>
      </LegalSection>

      <LegalSection titleTh="บริการ" titleEn="Service">
        <LegalBlock lang="th">
          <p>
            เราให้บริการแสดงข้อมูลทรีตเมนต์และจองคิวนวด/สปาออนไลน์
            รายการบริการ ราคา และช่วงเวลาอาจเปลี่ยนแปลงโดยไม่แจ้งล่วงหน้า
            การจองขึ้นอยู่กับความพร้อมของร้าน
          </p>
        </LegalBlock>
        <LegalBlock lang="en">
          <p>
            We provide treatment information and online massage/spa queue booking.
            Services, prices, and time slots may change without prior notice.
            Bookings are subject to availability.
          </p>
        </LegalBlock>
      </LegalSection>

      <LegalSection titleTh="การจองคิว" titleEn="Bookings">
        <LegalBlock lang="th">
          <ul>
            <li>คุณต้องให้ข้อมูลที่ถูกต้อง (ชื่อ เบอร์โทร วัน เวลา)</li>
            <li>หมายเลขคิวจะออกให้หลังยืนยันการจองสำเร็จ</li>
            <li>การจองวันเดียวกันไม่สามารถเลือกเวลาที่ผ่านไปแล้ว</li>
            <li>เราอาจปฏิเสธหรือยกเลิกการจองหากข้อมูลไม่ครบหรือมีเหตุจำเป็น</li>
          </ul>
        </LegalBlock>
        <LegalBlock lang="en">
          <ul>
            <li>You must provide accurate information (name, phone, date, time)</li>
            <li>A queue number is issued after successful confirmation</li>
            <li>Same-day bookings cannot select past time slots</li>
            <li>We may refuse or cancel bookings if information is incomplete or when necessary</li>
          </ul>
        </LegalBlock>
      </LegalSection>

      <LegalSection
        titleTh="การเลื่อนและยกเลิก"
        titleEn="Reschedule and cancellation"
      >
        <LegalBlock lang="th">
          <p>
            ลูกค้าสามารถเลื่อนหรือยกเลิกการจองฟรีล่วงหน้าอย่างน้อย 3 ชั่วโมง
            ก่อนเวลานัด (ตามนโยยบายร้าน) กรุณาติดต่อร้านผ่าน LINE หรือโทรศัพท์
          </p>
        </LegalBlock>
        <LegalBlock lang="en">
          <p>
            Customers may reschedule or cancel free of charge at least 3 hours before
            the appointment (store policy). Please contact us via LINE or phone.
          </p>
        </LegalBlock>
      </LegalSection>

      <LegalSection titleTh="พฤติกรรมที่ห้าม" titleEn="Prohibited conduct">
        <LegalBlock lang="th">
          <ul>
            <li>ให้ข้อมูลเท็จหรือจองในนามผู้อื่นโดยไม่ได้รับอนุญาต</li>
            <li>พยายามเข้าถึงระบบโดยไม่ได้รับอนุญาต</li>
            <li>ใช้บริการในทางที่ผิดกฎหมายหรือรบกวนผู้ใช้อื่น</li>
          </ul>
        </LegalBlock>
        <LegalBlock lang="en">
          <ul>
            <li>Providing false information or booking on behalf of others without consent</li>
            <li>Unauthorized access to our systems</li>
            <li>Using the service unlawfully or disrupting others</li>
          </ul>
        </LegalBlock>
      </LegalSection>

      <LegalSection titleTh="ข้อจำกัดความรับผิด" titleEn="Limitation of liability">
        <LegalBlock lang="th">
          <p>
            เราให้บริการ &quot;ตามสภาพ&quot; เท่าที่กฎหมายอนุญาต
            เราไม่รับผิดชอบความเสียหายจากเหตุสุดวิสัย การหยุดให้บริการชั่วคราว
            หรือปัญหาทางเทคนิคที่อยู่นอกเหนือการควบคุมที่สมเหตุสมผล
          </p>
        </LegalBlock>
        <LegalBlock lang="en">
          <p>
            The service is provided &quot;as is&quot; to the extent permitted by law.
            We are not liable for force majeure, temporary outages, or technical issues
            beyond our reasonable control.
          </p>
        </LegalBlock>
      </LegalSection>

      <LegalSection titleTh="การเปลี่ยนแปลง" titleEn="Changes">
        <LegalBlock lang="th">
          <p>
            เราอาจปรับปรุงข้อกำหนดนี้เป็นครั้งคราว
            การใช้บริการต่อหลังมีการเปลี่ยนแปลงถือว่ายอมรับข้อกำหนดที่แก้ไขแล้ว
          </p>
        </LegalBlock>
        <LegalBlock lang="en">
          <p>
            We may update these Terms from time to time. Continued use after changes
            constitutes acceptance of the revised Terms.
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
          </p>
        </LegalBlock>
        <LegalBlock lang="en">
          <p>
            {legalMetadata.site}
            <br />
            Email:{" "}
            <a href={`mailto:${legalMetadata.email}`}>{legalMetadata.email}</a>
          </p>
        </LegalBlock>
      </LegalSection>
    </LegalPageShell>
  );
}
