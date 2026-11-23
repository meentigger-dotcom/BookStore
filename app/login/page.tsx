import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "เข้าสู่ระบบ | CSbooks" };

export default function LoginPage() {
  return (
    <div className="auth">
      <div className="wrap authhead">
        <Link className="logo" href="/" aria-label="CSbooks">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="CSbooks" />
        </Link>
        <Link href="/">← กลับหน้าร้าน</Link>
      </div>

      <div className="wrap authwrap">
        <div className="authintro">
          <small className="eyebrow">WELCOME BACK</small>
          <h1>
            กลับมาอ่าน
            <br />
            <em>เรื่องราวที่ค้างไว้</em>
          </h1>
          <p>
            เข้าสู่ระบบเพื่อดูประวัติการสั่งซื้อ ติดตามพัสดุ
            และรับข้อความตอบกลับจากทางร้านได้ในที่เดียว
          </p>
          <div className="bookart">
            <strong>CSbooks</strong>
            <br />
            BOOKS FOR EVERY STORY
            <b>
              Est.
              <br />
              2026
            </b>
          </div>
        </div>

        <div className="panel">
          <h2>เข้าสู่ระบบ</h2>
          <p className="muted" style={{ marginBottom: 6 }}>
            ยินดีต้อนรับกลับสู่ร้าน CSbooks
          </p>
          <LoginForm />
          <div className="or">หรือ</div>
          <Link className="button-link" href="/register">
            สมัครสมาชิกใหม่
          </Link>
          <div className="demo-box">
            <small>บัญชีทดสอบ</small>
            <br />
            สมาชิก: kinami@example.com / 123456
            <br />
            แอดมิน: admin@csbook.com / รหัสที่คุณตั้งไว้
          </div>
        </div>
      </div>

      <div className="authfoot">© 2026 CSbooks. Student project</div>
    </div>
  );
}
