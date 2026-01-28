<div align="center">

# Endfield Auto Check-in

[![Version](https://img.shields.io/badge/Version-1.3.1-blue?style=flat-square)](https://github.com/kgyujin/endfield-auto-checkin/releases/tag/v1.3.1)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Chrome%20%7C%20Edge%20%7C%20Whale-orange?style=flat-square)](https://chromewebstore.google.com/)

[![GitBook](https://img.shields.io/badge/Docs-GitBook-3884FF?style=for-the-badge&logo=gitbook&logoColor=white)](https://kgyujins-organization.gitbook.io/endfield/)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/xog9)

<br/>

[🇰🇷 한국어](./README.md) | [🇺🇸 English](./README_EN.md) | [🇨🇳 简体中文](./README_ZH.md)

<br/>

**アークナイツ：エンドフィールド (SKPORT) 自動チェックイン拡張機能**

Endfield Auto Check-inは、  
**アークナイツ：エンドフィールド (SKPORT)** の毎日のチェックインを  
ログイン状態でバックグラウンドにて自動的に実行するChromiumベースのブラウザ拡張機能です。

</div>

---

## 📝 概要

| 項目 | 詳細 |
| :--- | :--- |
| **プラットフォーム** | Chrome, Edge, Whale などのChromiumベースブラウザ |
| **バージョン** | 1.3.1 |
| **動作条件** | SKPORTゲームサイトへのログイン状態 |
| **実行方式** | ローカルブラウザバックグラウンド自動化 |
| **外部通信** | なし (ただし、ユーザー設定時のDiscord通知を除く) |

<br/>

## ✨ 主な機能

### 👻 見えない自動チェックイン
- **サイレント自動化**: ブラウザ起動時にバックグラウンドで静かに実行されます。
- 作業を妨げたり、画面を遮ることはありません。

### ⏰ インテリジェントスケジューリング
- **スマートタイマー**: ゲームサーバーのリセット時間 (UTC+8 00:00) を自動的に計算します。
- すでにチェックイン済みの日は、不必要に実行されません。

### 🔔 Discord通知
- **Webhook連携**: チェックインの成功/失敗をDiscordに直接通知します。
- **リッチEmbed**: 獲得した報酬の画像や累積チェックイン日数も表示されます。
- **テストモード**: Webhook設定が正しく動作するかすぐに確認できます。

### 🔒 安全なローカル実行
- **ローカル実行**: すべての動作はブラウザ内部でのみ行われます。
- 設定したDiscord Webhook以外に個人情報を外部へ送信することはありません。

### ⚡ 同期時に即時実行
- **即時アクション**: アカウント連携（更新）と同時にチェックインを試行し、利便性を高めました。

### 🛡️ ステータスバッジ
- 拡張機能アイコンで状態を直感的に確認できます:
  - `(バッジなし)` : ✅ チェックイン完了
  - `X` (赤色) : ❌ ログインが必要、またはエラー発生

<br/>

## 🚀 インストール方法

1. このリポジトリ上部の **[Code]** ボタンをクリック → **Download ZIP** を選択してダウンロード
2. ダウンロードしたファイルを解凍
3. ブラウザのアドレスバーに `chrome://extensions` を入力して移動
4. 右上の **[デベロッパーモード]** スイッチをオンにする
5. 左上の **[パッケージ化されていない拡張機能を読み込む]** をクリック
6. 解凍したフォルダを選択すればインストール完了！

<br/>

## 📖 使い方

1. **初回ログイン**: SKPORTエンドフィールドのチェックインページにログインしてください。
2. **自動実行**: 以降、ブラウザを開くたびに拡張機能が自動でチェックインを行います。
3. **状態確認**: 拡張機能アイコンをクリックして、実行ログや状態を確認できます。
    - `CHECK NOW` ボタンで手動チェックインも可能です。

<br/>

## 🔧 トラブルシューティング

> [!WARNING]
> **「失敗」状態や「X」バッジが消えませんか？**

ログインセッション切れやデータの不整合が原因の可能性があります。以下の手順を試してください。

1. 拡張機能アイコンをクリック
2. 右上の **⚙️ 設定(歯車)** アイコンをクリック
3. **[データ初期化]** ボタンをクリック（すべてのデータが安全にリセットされます）
4. SKPORTサイトがリロードされたら、**再度ログイン**
5. ポップアップの案内に従って **[アカウント連携]** を再試行

<br/>

## ⚖️ 免責事項とライセンス

- 本プロジェクトは非公式の拡張機能です。
- 本プログラムの使用により発生した問題について、ユーザー本人が全責任を負うものとします。
- **MIT License**
