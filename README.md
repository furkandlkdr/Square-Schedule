# <img src="public/favicon.ico" width="32" height="32" style="vertical-align: middle;" /> Square Schedule

[![Made with ❤️ by Nafair](https://img.shields.io/badge/Made%20with%20%E2%9D%A4%EF%B8%8F%20by-Nafair-blue)](https://github.com/Nafair)
![License](https://img.shields.io/badge/license-MIT-green)

<p align="center">
  <a href="#türkçe">Türkçe</a> | <a href="#english">English</a>
</p>

![Square Schedule Banner](images/square-schedule-banner-3d.png)

---

<div id="türkçe"></div>

## 🇹🇷 Türkçe

Haftalık ders programlarını oluşturmak, yönetmek ve paylaşmak için geliştirilmiş, modern ve şık bir web uygulaması. React, TypeScript ve Vite ile geliştirildi.

### ✨ Özellikler

- 📊 **Görsel Program Tablosu** - 5 gün x 9 ders saati formatında net görünüm
- 🎨 **Çoklu Profil Desteği** - Birden fazla program oluşturun ve yönetin (Örn: Güz/Bahar dönemi)
- 🌓 **Karanlık/Aydınlık Mod** - Sistem tercihenize göre otomatik ayarlanır veya manuel değiştirilebilir
- 📥 **PNG Olarak İndir** - Programınızı yüksek kalitede görsel olarak kaydedin
- 🔄 **İçe/Dışa Aktarma** - Programlarınızı JSON formatında yedekleyin veya arkadaşlarınızla paylaşın
- 💾 **Otomatik Kayıt** - Tüm değişiklikler tarayıcınızda (localStorage) saklanır
- 🏫 **Derslik Açıklamaları** - Derslik kodları için özel açıklamalar ekleyin
- ⚠️ **Çakışma Kontrolü** - Aynı saate denk gelen derslerde otomatik uyarı sistemi
- 📚 **Alttan Ders İşaretleme** - Alttan alınan dersler için görsel ayrım

### 🚀 Hızlı Başlangıç

Proje yerel ortamınızda çalıştırmak için:

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev

# Üretim sürümü için build alın
npm run build
```

### 🎯 Kullanım Rehberi

1. **Ders Ekleme**: Sol paneldeki formu kullanarak derslerinizi ekleyin.
2. **Profil Yönetimi**: Sol üstteki menüden yeni program oluşturun veya mevcutları yönetin.
3. **Dışa Aktarma**:
   - **PNG İndir**: Görsel olarak kaydeder.
   - **JSON Dışa Aktar**: Veri dosyası olarak kaydeder (Yedekleme için).
   - **JSON İçe Aktar**: Yedek dosyasını geri yükler.
4. **Derslik Açıklamaları**: Sol menünün altından derslik kodlarını ve açıklamalarını girin.

### 🛠 Özelleştirme

`src/SquareScheduleMaker.tsx` dosyasından ders saatlerini (`TIME_SLOTS`) ve günleri (`DAYS`) kolayca değiştirebilirsiniz.

---

<div id="english"></div>

## 🇺🇸 English

A simple, elegant web app for creating and managing weekly course schedules. Built with React + TypeScript + Vite.

### ✨ Features

- 📊 **Visual Schedule Grid** - Clear view with 5 days x 9 time slots
- 🎨 **Multi-Profile Support** - Create and manage multiple schedules (e.g., Fall/Spring)
- 🌓 **Dark/Light Theme** - Auto-detects system preference or toggle manually
- 📥 **Export to PNG** - Save your schedule as a high-quality image
- 🔄 **Import/Export JSON** - Backup your data or share schedules with friends
- 💾 **Auto-Save** - All changes persist in browser localStorage
- 🏫 **Classroom Legends** - Add custom descriptions for room codes
- ⚠️ **Conflict Detection** - Automatic warnings for overlapping courses
- 📚 **Retake Course Marking** - Visual distinction for retake/repeated courses

### 🚀 Quick Start

To run the project locally:

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

### 🎯 User Guide

1. **Add Course**: Use the form in the sidebar to add your classes.
2. **Profile Management**: Use the top-left menu to create new schedules or manage existing ones.
3. **Export**:
   - **Download PNG**: Save as an image.
   - **Export JSON**: Save as a data file (for backup).
   - **Import JSON**: Restore from a backup file.
4. **Classroom Legends**: Enter room codes and descriptions at the bottom of the sidebar.

### 🛠 Customization

You can easily customize time slots (`TIME_SLOTS`) and days (`DAYS`) in `src/SquareScheduleMaker.tsx`.

---

**Made with ❤️ by Nafair**
