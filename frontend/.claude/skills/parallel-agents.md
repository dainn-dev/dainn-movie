# Parallel Agents Skill

Dùng khi task có nhiều phần lớn, độc lập với nhau.

## Luôn Hỏi Trước

KHÔNG dispatch agents mà không có confirmation. Present:
- Agent nào làm gì
- File nào mỗi agent owns
- Tradeoffs của parallel vs sequential

Chờ explicit approval.

## Ví dụ phù hợp cho project này

- Agent 1: Build movie listing API (ASP.NET Core) + Agent 2: Kết nối MovieGrid component với API
- Agent 1: Build auth API endpoints + Agent 2: Build login/signup form logic
- Agent 1: Build friend system API + Agent 2: Update ChatSystem component

## Dispatching

Mỗi agent prompt phải include:
1. Mô tả task chính xác
2. File paths agent owns
3. File paths agent KHÔNG được touch
4. Cách run build check: `npm run build`
5. Definition of done

## Sau khi Hoàn Thành

1. Review tất cả changes cùng nhau
2. Run `npm run build` để check TypeScript
3. Resolve conflicts
4. Commit cùng nhau
