# UI Review Skill

Chạy sau khi implement bất kỳ UI changes nào.

## Step 1: Start Dev Server

```bash
npm run dev
```

Chờ output: `▲ Next.js 15.x.x` + `Local: http://localhost:3000`

## Step 2: Mở Browser với Playwright

Dùng Playwright MCP tool để:
1. Navigate đến `http://localhost:3000`
2. Navigate đến page/feature đã thay đổi

## Step 3: Checklist trước khi show user

Tự check các điểm sau:
- [ ] Brand color `#dd003f` được dùng đúng chỗ (primary buttons, accents)
- [ ] Font: Dosis cho headings, Nunito cho body text
- [ ] Responsive: trông ổn trên mobile (< 768px) và desktop
- [ ] Dark background sections (hero, slider) dùng `bg-black` hoặc `bg-gray-900`
- [ ] Cards có `rounded-lg shadow-lg` nhất quán
- [ ] Hover states hoạt động

## Step 4: Dừng lại và Chờ

Báo user:
- "Tôi đã mở [URL] trong browser"
- "Đang ở trang [page name / route]"
- "Bạn review UI và cho tôi biết cần điều chỉnh gì"

**DỪNG TẠI ĐÂY. Chờ user response.**

## Step 5: Iterate

Nếu user yêu cầu thay đổi: apply → reload → hỏi review lại.
Nếu user approve: tiếp tục task.
