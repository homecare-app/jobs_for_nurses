async function run() {
  const form = new FormData();
  form.append('fullName', 'Test Name');
  form.append('phone', '123456');

  try {
    const res = await fetch('http://127.0.0.1:3000/api/apply', {
      method: 'POST',
      body: form
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body:', text.substring(0, 100));
  } catch (e) {
    console.error(e);
  }
}
run();
