"use client";

import { useCallback, useEffect, useState } from "react";
import { fmt } from "@/lib/book";

type Book = {
  book_id: number;
  isbn: string;
  book_name: string;
  author: string | null;
  description: string | null;
  selling_price: string | number;
  image: string | null;
  stock_quantity: number;
  status: string;
  category_id: number;
  publisher_id: number;
  type_id: number;
  original: number;
  price: number;
  percent: number;
  tb_category: { category_name: string };
};

type Meta = {
  categories: Array<{ category_id: number; category_name: string }>;
  publishers: Array<{ publisher_id: number; publisher_name: string }>;
  types: Array<{ type_id: number; type_name: string }>;
};

const emptyForm = {
  book_name: "",
  isbn: "",
  author: "",
  description: "",
  image: "",
  selling_price: "",
  stock_quantity: "",
  category_id: "",
  publisher_id: "",
  type_id: "",
  status: "มีจำหน่าย",
};

export default function AdminBooksList() {
  const [items, setItems] = useState<Book[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"ok" | "err">("ok");

  const load = useCallback(async () => {
    try {
      const [bRes, mRes] = await Promise.all([
        fetch("/api/admin/books"),
        fetch("/api/admin/meta"),
      ]);
      const bData = await bRes.json();
      const mData = await mRes.json();
      setItems(bData.items ?? []);
      setMeta(mData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openNew() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setMsg("");
    setShowForm(true);
  }

  function openEdit(b: Book) {
    setEditingId(b.book_id);
    setForm({
      book_name: b.book_name,
      isbn: b.isbn,
      author: b.author ?? "",
      description: b.description ?? "",
      image: b.image ?? "",
      selling_price: String(Number(b.selling_price)),
      stock_quantity: String(b.stock_quantity),
      category_id: String(b.category_id),
      publisher_id: String(b.publisher_id),
      type_id: String(b.type_id),
      status: b.status,
    });
    setMsg("");
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        selling_price: Number(form.selling_price),
        stock_quantity: Number(form.stock_quantity),
        category_id: Number(form.category_id),
        publisher_id: Number(form.publisher_id),
        type_id: Number(form.type_id),
      };
      const res = await fetch(
        editingId ? `/api/admin/books/${editingId}` : "/api/admin/books",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setMsgType("err");
        setMsg(data.error ?? "บันทึกไม่สำเร็จ");
        return;
      }
      setMsgType("ok");
      setMsg(editingId ? "แก้ไขแล้ว" : "เพิ่มหนังสือแล้ว");
      setShowForm(false);
      await load();
    } catch {
      setMsgType("err");
      setMsg("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  async function remove(b: Book) {
    if (!confirm(`ลบหนังสือ "${b.book_name}" ?`)) return;
    setMsg("");
    try {
      const res = await fetch(`/api/admin/books/${b.book_id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setMsgType("err");
        setMsg(data.error ?? "ลบไม่สำเร็จ");
        return;
      }
      setMsgType("ok");
      setMsg("ลบแล้ว");
      await load();
    } catch {
      setMsgType("err");
      setMsg("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
    }
  }

  const shown = items.filter(
    (b) =>
      !q.trim() ||
      b.book_name.toLowerCase().includes(q.toLowerCase()) ||
      (b.author ?? "").toLowerCase().includes(q.toLowerCase()) ||
      b.isbn.includes(q.trim())
  );

  const bind = (k: keyof typeof emptyForm) => ({
    value: form[k],
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => setForm((s) => ({ ...s, [k]: e.target.value })),
  });

  return (
    <div>
      <div className="admin-heading">
        <div>
          <small className="eyebrow">BOOKS</small>
          <h1 style={{ marginBottom: 0 }}>จัดการหนังสือ ({items.length})</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหาชื่อ/ผู้แต่ง/ISBN"
            style={{
              border: "1px solid #ddd5d3",
              padding: "9px 12px",
              fontSize: 12,
              width: 200,
            }}
          />
          <button onClick={openNew} className="btn small">
            + เพิ่มหนังสือ
          </button>
        </div>
      </div>

      {msg && <p className={`notice ${msgType === "ok" ? "ok" : "error"}`}>{msg}</p>}

      {showForm && meta && (
        <form className="panel editor" onSubmit={save}>
          <h2>{editingId ? `แก้ไขหนังสือ #${editingId}` : "เพิ่มหนังสือใหม่"}</h2>
          <label>
            ชื่อหนังสือ *
            <input {...bind("book_name")} required />
          </label>
          <div className="form-grid">
            <label>
              ISBN *
              <input {...bind("isbn")} required />
            </label>
            <label>
              ผู้แต่ง
              <input {...bind("author")} />
            </label>
            <label>
              ราคาขาย *
              <input type="number" step="0.01" min="0" {...bind("selling_price")} required />
            </label>
            <label>
              สต็อก *
              <input type="number" min="0" {...bind("stock_quantity")} required />
            </label>
            <label>
              หมวดหมู่ *
              <select {...bind("category_id")} required>
                <option value="">— เลือก —</option>
                {meta.categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              สำนักพิมพ์ *
              <select {...bind("publisher_id")} required>
                <option value="">— เลือก —</option>
                {meta.publishers.map((p) => (
                  <option key={p.publisher_id} value={p.publisher_id}>
                    {p.publisher_name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              ประเภท *
              <select {...bind("type_id")} required>
                <option value="">— เลือก —</option>
                {meta.types.map((t) => (
                  <option key={t.type_id} value={t.type_id}>
                    {t.type_name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              สถานะ
              <select {...bind("status")}>
                <option>มีจำหน่าย</option>
                <option>สั่งจองล่วงหน้า</option>
                <option>ไม่มีจำหน่าย</option>
              </select>
            </label>
            <label>
              URL รูปปก
              <input {...bind("image")} placeholder="/images/xxx.jpg" />
            </label>
          </div>
          <label>
            คำอธิบาย
            <textarea rows={3} {...bind("description")} />
          </label>

          <div className="form-actions">
            <button type="submit" disabled={saving} className="btn small">
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
            <button type="button" className="outline small-btn" onClick={() => setShowForm(false)}>
              ยกเลิก
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="empty">กำลังโหลด...</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>หนังสือ</th>
                <th>หมวด</th>
                <th>ราคา</th>
                <th>สต็อก</th>
                <th>สถานะ</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "#999" }}>
                    ไม่พบหนังสือ
                  </td>
                </tr>
              )}
              {shown.map((b) => (
                <tr key={b.book_id}>
                  <td>{b.book_id}</td>
                  <td>
                    <b>{b.book_name}</b>
                    <br />
                    <small className="muted">{b.author}</small>
                  </td>
                  <td>{b.tb_category.category_name}</td>
                  <td>
                    <b style={{ color: "var(--red)" }}>฿{fmt(b.price)}</b>
                    {b.percent > 0 && (
                      <small className="old-price" style={{ display: "block" }}>
                        ฿{fmt(b.original)}
                      </small>
                    )}
                  </td>
                  <td>
                    <span
                      className={
                        b.stock_quantity === 0
                          ? "badge off"
                          : b.stock_quantity <= 5
                            ? "badge warn"
                            : "badge ok"
                      }
                    >
                      {b.stock_quantity}
                    </span>
                  </td>
                  <td>{b.status}</td>
                  <td>
                    <div className="table-actions">
                      <button onClick={() => openEdit(b)}>แก้ไข</button>
                      <button className="delete" onClick={() => remove(b)}>
                        ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
