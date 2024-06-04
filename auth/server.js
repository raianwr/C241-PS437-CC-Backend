const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');

// Inisialisasi Firestore Admin SDK
const serviceAccount = require('../firestore-serviceaccount.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();
app.use(bodyParser.json());

// Buat akun endpoint
app.post('/register', async (req, res) => {
  const { email, password, birthdate } = req.body;

  if (!email || !password || !birthdate) {
    return res.status(400).send({ message: 'Tolong masukan data Email, password, dan tanggal lahir.' });
  }

  try {
    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();
    
    if (doc.exists) {
      return res.status(400).send({ message: 'Email yang anda daftarkan sudah digunakan, coba gunakan email lain.' });
    }

    await userRef.set({
      email,
      password,
      birthdate
    });

    res.status(201).send({ message: 'Akun berhasil didaftarkan' });
  } catch (error) {
    res.status(500).send({ message: 'Akun gagal didaftarkan.', error });
  }
});

// Login akun endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ message: 'Tolong masukan email dan password dengan benar.' });
  }

  try {
    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(400).send({ message: 'Email yang anda masukan tidak terdaftar p[ada sistem kami].' });
    }

    const user = doc.data();
    
    if (user.password !== password) {
      return res.status(400).send({ message: 'Password salah, harap coba lagi.' });
    }

    res.status(200).send({ message: 'Login berhasil.', user });
  } catch (error) {
    res.status(500).send({ message: 'Terjadi masalah saat login.', error });
  }
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
