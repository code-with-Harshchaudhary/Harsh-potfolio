import { useState, FormEvent } from 'react';

export default function ContactSection() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus('sent');
        setTimeout(() => { setStatus('idle'); (e.target as HTMLFormElement).reset(); }, 2000);
      } else {
        setStatus('idle');
        alert('Failed to send message. Please try again.');
      }
    } catch {
      setStatus('idle');
      alert('Failed to send message. Please try again.');
    }
  };

  return (
    <section id="contact" className="page-section page-contact" style={{ background: 'linear-gradient(180deg, #EDE8E0 0%, #E5DED4 100%)' }}>
      <div className="section-content">
        <h2 className="section-title">CONTACT</h2>
        <div className="contact-layout">
          <div className="contact-info">
            <p className="contact-intro">Let's create something amazing together.</p>
            <div className="contact-links">
              <a href="mailto:hello@yourname.com" className="contact-link">hello@yourname.com</a>
              <a href="#" className="contact-link" target="_blank" rel="noopener">LinkedIn</a>
              <a href="#" className="contact-link" target="_blank" rel="noopener">Instagram</a>
            </div>
          </div>
          <form className="contact-form" id="contactForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <input type="text" id="name" name="name" placeholder="Harsh chaudhary" required />
              <label htmlFor="name">Name</label>
            </div>
            <div className="form-group">
              <input type="email" id="email" name="email" placeholder="Harshch310702@gmail.com" required />
              <label htmlFor="email">Email</label>
            </div>
            <div className="form-group">
              <textarea id="message" name="message" placeholder="Your Message" rows={5} required />
              <label htmlFor="message">Message</label>
            </div>
            <button type="submit" className="submit-btn" disabled={status === 'sending'}>
              <span>{status === 'sent' ? 'SENT!' : status === 'sending' ? 'SENDING...' : 'SEND MESSAGE'}</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
