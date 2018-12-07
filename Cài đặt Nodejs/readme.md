

# Cài đặt Nodejs

## Cài đặt Nodejs trên windows

Đối với windows, bạn chỉ cần vào trang chủ Nodejs.org để download và cài đặt Nodejs. Để kiểm tra đã cài đặt được nodejs hay chưa bạn mở chương trình "Node.js Command Prompt" lên bằng cách vào Start gõ search từ "prompt" rồi gõ:
```sh
node -v
```
Nếu xuất ra version của Nodejs tức là bạn đã cài đặt thành công.
```
v8.11.1
```
Tiếp theo là kiểm tra NPM - Công cụ quản lý package của NodeJS.
```sh
npm -v
```
Tường tự nếu xuất ra version của NPM bạn đã cài đặt thành công NPM rồi nhé.

## Cài đặt Nodejs trên linux

Đầu tiên, bạn nên update tất cả package của hệ điều hành để đảm bảo việc cài đặt NodeJS không gặp vấn đề.
```
sudo apt-get update
```
Cài Nodejs:
```
sudo apt-get install nodejs
```
Cài đặt NPM:
```
sudo apt-get install npm
```
Để kiểm tra NPM và NodeJS đã cài đặt được chưa:
```
nodejs -v
npm -v
```