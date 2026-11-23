import Link from "next/link";
import RegisterForm from "@/components/RegisterForm";

export const metadata = { title: "สมัครสมาชิก | CSbooks" };

export default function RegisterPage() {
  return (
    <div className="auth">
      <div className="wrap authhead">
        <Link className="logo" href="/" aria-label="CSbooks">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="CSbooks" />
          <span>
            CS<strong>books</strong>
            <small>BOOKS FOR EVERY STORY</small>
          </span>
        </Link>
        <Link href="/">← กลับหน้าร้าน</Link>
      </div>

      <div className="wrap authwrap">
        <div className="authintro">
          <small className="eyebrow">JOIN CSBOOKS</small>
          <h1>
            เปิดประตูสู่
            <br />
            <em>โลกของนักอ่าน</em>
          </h1>
          <p>
            สมัครสมาชิกฟรี เพื่อสั่งซื้อหนังสือ ติดตามสถานะพัสดุ
            และเก็บประวัติการสั่งซื้อไว้ดูได้ทุกเมื่อ
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
          <h2>สมัครสมาชิก</h2>
          <p className="muted" style={{ marginBottom: 6 }}>
            กรอกข้อมูลเพื่อสร้างบัญชีใหม่
          </p>
          <RegisterForm />
        </div>
      </div>

      <div className="authfoot">© 2026 CSbooks. Student project</div>
    </div>
  );
}
