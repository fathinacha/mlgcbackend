#!/bin/bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository atau copy kode
git clone [URL_REPO] /app

cd /app
npm install
npm start 