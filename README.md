# Bấm giờ tập luyện — TH02

Ứng dụng React + TypeScript cho bài thực hành Lập trình Web nâng cao.

## Chạy project

Yêu cầu Node.js 22.12 trở lên (22 hoặc 24 LTS).

```sh
npm install
npm run dev
```

```sh
npm run build
npm test
npm run coverage
```

## Tiến độ

- **Phần 1:** hoàn thành kho 10.000 bài tập, React Router v6, danh sách ảo hóa, tìm kiếm debounce 300ms, lọc nhóm cơ và sắp xếp.
- **Phần 2:** chưa thực hiện — Zustand, đồng hồ buổi tập, bài tập đã lưu.
- **Phần 3:** chưa thực hiện — giáo án, Context/useReducer, giao diện sáng/tối, lazy routes.
- **Phần 4:** chưa thực hiện — bộ kiểm thử Vitest/React Testing Library và ảnh coverage.

Các route `/saved`, `/routines`, `/routines/:id` đã có trang giữ chỗ. Ba nút thao tác trên mỗi dòng đang khóa, chờ kết nối store ở phần 2. Chưa có file `*.test.*`; cấu hình kiểm thử đã được chuẩn bị theo đề, bộ test sẽ được viết ở phần 4.

## Tự kiểm tra phần 1

1. Mở `/`: hiện “Tìm thấy 10000 bài tập”; danh sách cao 560px, dòng cao 56px. DOM chỉ chứa các dòng đang nhìn thấy và một vài dòng đệm.
2. Gõ `đẩy`: sau khi ngừng gõ 300ms còn 1250 bài; chọn nhóm `Vai` còn 250 bài.
3. Chọn `Tất cả`, tìm `đức anh`: có 1000 bài; tìm `xyz`: hiện trạng thái không có kết quả.
4. Xóa từ khóa, chọn `Tên A–Z`: bài đầu là `Bật chậm 1`. Chọn thời lượng tăng dần: bài ngắn nhất có thời lượng `0:30`.
5. Khi đang gõ, các dòng bài tập không render lại cho tới khi từ khóa debounce thay đổi. `ExerciseList`, `VirtualizedRow`, `ExerciseRow` dùng `memo`, dữ liệu truyền danh sách dùng `useMemo`; key dùng `exercise.id`.

Hoàn thành từng phần rồi tự commit với thông điệp tương ứng `Phan 1`, `Phan 2`, `Phan 3`, `Phan 4`.
