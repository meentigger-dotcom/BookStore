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
  tb_publisher: { publisher_name: string };
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
    load();
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

  const f = (k: keyof typeof emptyForm) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((s) => ({ ...s, [k]: e.target.value })),
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-extrabold text-slate-900">
          จัดการหนังสือ ({items.length})
        </h1>
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหาชื่อ/ผู้แต่ง/ISBN"
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#f04e23]"
          />
          <button onClick={openNew} className="btn-chunky px-5 py-2 text-sm">
            + เพิ่มหนังสือ
          </button>
        </div>
      </div>

      {msg && (
        <p
          className={`mt-4 rounded-lg px-4 py-3 text-sm ${
            msgType === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {msgType === "ok" ? "✓ " : "⚠ "}
          {msg}
        </p>
      )}

      {/* ฟอร์มเพิ่ม/แก้ไข */}
      {showForm && meta && (
        <form
          onSubmit={save}
          className="mt-5 grid grid-cols-1 gap-3 rounded-xl border-2 border-orange-200 bg-orange-50/50 p-4 sm:grid-cols-2"
        >
          <h2 className="font-bold text-slate-700 sm:col-span-2">
            {editingId ? `แก้ไขหนังสือ #${editingId}` : "เพิ่มหนังสือใหม่"}
          </h2>

          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold text-neutral-600">ชื่อหนังสือ *</span>
            <input {...f("book_name")} required className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#f04e23]" />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-neutral-600">ISBN *</span>
            <input {...f("isbn")} required className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#f04e23]" />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-neutral-600">ผู้แต่ง</span>
            <input {...f("author")} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#f04e23]" />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-neutral-600">ราคาขาย *</span>
            <input type="number" step="0.01" min="0" {...f("selling_price")} required className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#f04e23]" />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-neutral-600">สต็อก *</span>
            <input type="number" min="0" {...f("stock_quantity")} required className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#f04e23]" />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-neutral-600">หมวดหมู่ *</span>
            <select {...f("category_id")} required className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#f04e23]">
              <option value="">— เลือก —</option>
              {meta.categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-neutral-600">สำนักพิมพ์ *</span>
            <select {...f("publisher_id")} required className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#f04e23]">
              <option value="">— เลือก —</option>
              {meta.publishers.map((p) => (
                <option key={p.publisher_id} value={p.publisher_id}>
                  {p.publisher_name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-neutral-600">ประเภท *</span>
            <select {...f("type_id")} required className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#f04e23]">
              <option value="">— เลือก —</option>
              {meta.types.map((t) => (
                <option key={t.type_id} value={t.type_id}>
                  {t.type_name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-neutral-600">สถานะ</span>
            <select {...f("status")} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#f04e23]">
              <option>มีจำหน่าย</option>
              <option>สั่งจองล่วงหน้า</option>
              <option>ไม่มีจำหน่าย</option>
            </select>
          </label>

          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold text-neutral-600">URL รูปปก</span>
            <input {...f("image")} placeholder="/images/xxx.jpg" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#f04e23]" />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold text-neutral-600">คำอธิบาย</span>
            <textarea {...f("description")} rows={3} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#f04e23]" />
          </label>

          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" disabled={saving} className="btn-chunky px-6 py-2.5 text-sm disabled:opacity-50">
              {saving ? "กำลังบันทึก..." : "💾 บันทึก"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-full border border-neutral-300 bg-white px-6 py-2.5 text-sm font-bold text-slate-600"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      )}

      {/* ตาราง */}
      {loading ? (
        <p className="mt-6 text-neutral-500">กำลังโหลด...</p>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs text-neutral-500">
                <th className="px-3 py-2.5">#</th>
                <th className="px-3 py-2.5">หนังสือ</th>
                <th className="px-3 py-2.5">หมวด</th>
                <th className="px-3 py-2.5">ราคา</th>
                <th className="px-3 py-2.5">สต็อก</th>
                <th className="px-3 py-2.5">สถานะ</th>
                <th className="px-3 py-2.5 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-neutral-400">
                    ไม่พบหนังสือ
                  </td>
                </tr>
              )}
              {shown.map((b) => (
                <tr key={b.book_id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/60">
                  <td className="px-3 py-2.5 font-bold text-neutral-400">{b.book_id}</td>
                  <td className="px-3 py-2.5">
                    <p className="line-clamp-1 font-semibold">{b.book_name}</p>
                    <p className="text-xs text-neutral-500">{b.author}</p>
                  </td>
                  <td className="px-3 py-2.5 text-xs">{b.tb_category.category_name}</td>
                  <td className="px-3 py-2.5">
                    <span className="font-bold text-[#f04e23]">฿{fmt(b.price)}</span>
                    {b.percent > 0 && (
                      <span className="block text-[11px] text-neutral-400 line-through">
                        ฿{fmt(b.original)}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        b.stock_quantity === 0
                          ? "bg-red-100 text-red-700"
                          : b.stock_quantity <= 5
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {b.stock_quantity}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs">{b.status}</td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      onClick={() => openEdit(b)}
                      className="mr-2 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => remove(b)}
                      className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                    >
                      ลบ
                    </button>
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
