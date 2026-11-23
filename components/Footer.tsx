import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-foot" id="contact">
      <div className="wrap foot">
        <div>
          <Link className="logo footlogo" href="/" aria-label="CSbooks">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="CSbooks" />
          </Link>
          <p>
            ร้านหนังสือออนไลน์สำหรับคนรักการอ่าน รวมหนังสือหลากหลายหมวดไว้ในที่เดียว
          </p>
          <p>✉ support@csbook.com</p>
          <p>☎ 02-123-4567</p>
        </div>

        <div>
          <h3>เมนูนำทางลัด</h3>
          <Link href="/">หน้าแรก</Link>
          <Link href="/books">หนังสือทั้งหมด</Link>
          <Link href="/books">หมวดหมู่หนังสือ</Link>
          <Link href="/promotions">โปรโมชั่น</Link>
        </div>

        <div>
          <h3>บริการลูกค้า</h3>
          <Link href="/cart">ตะกร้าสินค้า</Link>
          <Link href="/account">บัญชีสมาชิก</Link>
          <Link href="/orders">ประวัติการสั่งซื้อ</Link>
          <Link href="/track">ติดตามพัสดุ</Link>
          <Link href="/contact">ติดต่อเรา</Link>
        </div>

        <div>
          <h3>ติดตาม CSbooks</h3>
          <p>ติดตามข่าวสารและหนังสือใหม่ได้ที่</p>
          <div className="social">
            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">
              f
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">
              ig
            </a>
            <a href="https://line.me/" target="_blank" rel="noreferrer">
              LINE
            </a>
          </div>
          <small>ลิงก์โซเชียลเป็นช่องทางตัวอย่าง สามารถเปลี่ยนเป็นบัญชีร้านได้</small>
        </div>
      </div>
      <div className="copyright">
        © 2026 CSbooks. Student project — จัดทำเพื่อการศึกษา
      </div>
    </footer>
  );
}
