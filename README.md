
# Techeazy Angular Website

A modern **Angular 18** project generated using the [Angular CLI](https://github.com/angular/angular-cli).

## 🔧 Requirements

* **Node.js** version `>=18`
* **Angular CLI** version `^18.2.11`

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/techeazy-consulting/techeazy-angular-website.git
```

### 2. Go to Project Directory

```bash
cd techeazy-angular-website
```

### 3. Install Dependencies

```bash
npm install
```

---

## 🧪 Run Project in Different Environments

### 1. Run Default Environment

```bash
ng serve
```

👉 Uses `src/environments/environment.ts`
(Default Angular environment)

---

### 2. Run Development Environment

```bash
ng serve --configuration=dev
```

👉 Uses `src/environments/environment.dev.ts`

---

### 3. Run Staging Environment

```bash
ng serve --configuration=stage
```

👉 Uses `src/environments/environment.stage.ts`

---

### 4. Run Production Environment

```bash
ng serve --configuration=production
```

👉 Uses `src/environments/environment.prod.ts`

---

## 📦 Build for Stage and Production

### 1. Build Staging Bundle

```bash
ng build --configuration=stage
```

👉 Builds using `environment.stage.ts`
Output folder: `dist/techeazy-angular-website/browser`

### 2. Build Production Bundle

```bash
ng build --configuration=production
```

👉 Builds using `environment.prod.ts`
Output folder: `dist/techeazy-angular-website/browser`

---

