# InvoiceLite

> A simple, professional invoice generator for Windows.

InvoiceLite is a lightweight desktop invoice generator built with **HTML, CSS, Vanilla JavaScript, and Electron**.

Create professional invoices, add products or services, calculate taxes and discounts automatically, add your business logo, and print or save invoices as PDF.

---

## 📥 Download

### Latest Release

Download the latest version of InvoiceLite from the **Releases** section of this repository.

**[Download InvoiceLite for Windows](../../releases/latest)**

The Windows installer is provided as an `.exe` file.

### Installation

1. Download the latest `InvoiceLite Setup.exe`
2. Run the installer
3. Choose your installation location
4. Complete the installation
5. Launch **InvoiceLite** from the Desktop or Start Menu

No Node.js or additional software is required to use the released application.

---

## ✨ Features

- Create professional invoices
- Add multiple invoice items
- Add products and services
- Enter quantity and unit price
- Automatic item calculations
- Automatic subtotal calculation
- Tax calculation
- Discount calculation
- Multiple currency options
- Business information
- Customer information
- Invoice numbers and dates
- Custom business logo
- Live invoice preview
- Print invoices
- Save invoices as PDF
- Local invoice data storage
- Responsive interface
- Windows desktop application
- Custom InvoiceLite branding

---

## 💱 Supported Currencies

- USD — US Dollar
- EUR — Euro
- GBP — British Pound
- PKR — Pakistani Rupee
- AED — UAE Dirham
- SAR — Saudi Riyal

---

## 🧮 Automatic Calculations

InvoiceLite automatically calculates the following:

### Item Total

```text
Quantity × Unit Price
```

### Subtotal

```text
Sum of all Item Totals
```

### Discount

```text
Subtotal × Discount Rate / 100
```

### Tax

Tax is calculated after the discount:

```text
(Subtotal - Discount Amount) × Tax Rate / 100
```

### Final Total

```text
Subtotal - Discount Amount + Tax Amount
```

---

## 🖥️ Screenshots

Add screenshots to the `screenshots/` folder and update the paths below.

### Invoice Editor

![InvoiceLite Editor](screenshots/editor.png)

### Invoice Preview

![InvoiceLite Preview](screenshots/preview.png)

---

## 🛠️ Built With

- HTML5
- CSS3
- Vanilla JavaScript
- Electron
- Electron Builder
- LocalStorage
- Browser Print API

---

## 🔒 Privacy

InvoiceLite is designed with local-first functionality.

Your invoice information is processed locally by the application. The core application does not require an external server or account to create invoices.

---

## 👨‍💻 Run From Source

If you want to modify or develop InvoiceLite, you can run the project from source.

### Requirements

- Node.js
- npm
- Windows

### Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/invoicelite.git
cd invoicelite
```

### Install dependencies

```bash
npm install
```

### Start InvoiceLite

```bash
npm start
```

---
## 📁 Project Structure

```text
invoicelite/
│
├── assets/
│   └── invoicelite.ico
│
├── css/
│   └── style.css
│
├── js/
│   └── script.js
│
├── screenshots/
│   ├── editor.png
│   └── preview.png
│
├── index.html
├── main.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

## 🚀 Releases

InvoiceLite uses **GitHub Releases** to distribute stable Windows versions.

Each release may include:

- Windows installer
- Release notes
- New features
- Bug fixes
- Improvements

Check the **Releases** section of this repository to find available versions.

---

## 🗺️ Roadmap

Possible future improvements include:

- Multiple invoice templates
- Custom invoice colors
- Invoice history
- Invoice duplication
- Customer management
- Product management
- Payment status
- Import/export invoice data
- Advanced PDF generation
- Cloud storage
- User accounts
- Online invoice sharing
- Email invoice sharing

---

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Test the application
5. Submit a pull request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Taha Khan**

Built with HTML, CSS, JavaScript, and Electron.
