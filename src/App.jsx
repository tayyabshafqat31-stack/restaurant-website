import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X, 
  ArrowRight, 
  MapPin, 
  Clock, 
  Phone, 
  Star, 
  Check,
  Flame,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Mail
} from 'lucide-react';

// Firebase Imports
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// --- Your Specific Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyBskIUexXZR0m4txgGm5CWk1oETW5ygZdg",
  authDomain: "ember-oak-e4c45.firebaseapp.com",
  projectId: "ember-oak-e4c45",
  storageBucket: "ember-oak-e4c45.firebasestorage.app",
  messagingSenderId: "314291658657",
  appId: "1:314291658657:web:54fa4d2e783cbd03aeb5e0"
};

// Initialize Firebase (with check to prevent multiple initialization errors)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Use __app_id if available (standard for this environment), fallback to your project ID
const appId = typeof __app_id !== 'undefined' ? __app_id : 'ember-oak-e4c45';

// --- Data ---
const menuItems = [
  { id: 1, name: 'Finger Fish', category: 'starters', price: 4, description: 'Crispy golden fish strips, served with tartar sauce and lemon wedges', image: 'fish.jpg' },
  { id: 2, name: 'Chicken Dumplings', category: 'starters', price: 4, description: 'Hand-crafted dumplings filled with seasoned chicken, ginger soy dipping sauce', image: 'dumpling.jpg' },
  { id: 3, name: 'Creamy Chicken Soup', category: 'starters', price: 6, description: 'Rich and comforting chicken soup with vegetables and fresh herbs', image: 'soup.jpg' },
  { id: 4, name: 'Beef Steak', category: 'mains', price: 8, description: '28-day dry-aged ribeye, bone marrow butter, roasted shallots', image: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=600&q=80' },
  { id: 5, name: 'Signature Pizza', category: 'mains', price: 10, description: 'Crispy thin crust topped with roasted duck, hoisin sauce, mozzarella, and scallions', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80' },
  { id: 6, name: 'Chicken Broast', category: 'mains', price: 10, description: 'Pressure-fried golden chicken, juicy inside and crispy outside, served with fries and coleslaw', image: 'chicken.jpeg' },
  { id: 7, name: 'Burnt Honey Panna Cotta', category: 'desserts', price: 3, description: 'Caramelized honey cream, fresh berries, mint', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80' },
  { id: 8, name: 'Chocolate Ember Tart', category: 'desserts', price: 5, description: 'Dark chocolate ganache, sea salt, vanilla chantilly', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80' },
  { id: 9, name: 'Smoked Vanilla Creme', category: 'desserts', price: 6, description: 'Smoked vanilla bean, caramel tuile, seasonal fruit', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80' }
];

const galleryItems = [
  { image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', span: 'col-span-2 row-span-2' },
  { image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80', span: '' },
  { image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&q=80', span: '' },
  { image: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=600&q=80', span: '' },
  { image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80', span: '' },
  { image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', span: 'col-span-2' },
  { image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&q=80', span: '' },
  { image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&q=80', span: '' }
];

const testimonials = [
  { name: 'Sarah Mitchell', role: 'Food Critic', text: 'Ember & Oak redefined fine dining for me. The finger fish was absolutely exceptional - perfectly crispy outside, tender inside. An unforgettable experience.', rating: 5 },
  { name: 'James Chen', role: 'Regular Guest', text: 'Every visit feels like coming home to luxury. The chicken dumplings are the best I have ever had. This is our favorite spot for celebrations.', rating: 5 },
  { name: 'Emily Rodriguez', role: 'Wine Enthusiast', text: 'The creamy chicken soup warmed my soul on a cold evening. Combined with the chef\'s recommendations, it was a journey through flavors I never knew existed.', rating: 5 }
];

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const heroBgRef = useRef(null);

  // --- Firebase Auth Setup ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth failed:", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // --- Scroll & Reveal Effects ---
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      if (heroBgRef.current) {
        heroBgRef.current.style.transform = `translateY(${window.scrollY * 0.4}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    reveals.forEach(el => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const filteredMenu = useMemo(() => {
    return currentFilter === 'all' 
      ? menuItems 
      : menuItems.filter(item => item.category === currentFilter);
  }, [currentFilter]);

  // --- Email Notification Function ---
  const sendEmailNotification = async (data) => {
    try {
      await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: 'service_etu7asn', 
          template_id: 'template_vruen3p', 
          user_id: 'LK95ADyfRsk1p19PU', 
          template_params: {
            owner_email: 'tayyabshafqat31@gmail.com',
            customer_name: data.fullName,
            customer_email: data.email,
            guests: data.guests,
            date: data.reservationDate,
            requests: data.specialRequests || 'None'
          }
        })
      });
    } catch (err) {
      console.error("Email delivery failed:", err);
    }
  };

  // --- Handle Reservation ---
  const handleReservation = async (e) => {
    e.preventDefault();
    if (!user) return; 

    setIsSubmitting(true);
    const formData = new FormData(e.target);
    
    const reservationData = {
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      guests: formData.get('guests'),
      reservationDate: formData.get('reservationDate'),
      specialRequests: formData.get('specialRequests'),
      createdAt: serverTimestamp(),
      userId: user.uid
    };

    try {
      // Save to Firestore using mandatory path structure
      const reservationsRef = collection(db, 'artifacts', appId, 'public', 'data', 'reservations');
      await addDoc(reservationsRef, reservationData);
      
      // Trigger Email Notification
      await sendEmailNotification(reservationData);
      
      setShowSuccessModal(true);
      e.target.reset();
    } catch (error) {
      console.error("Error saving reservation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#0a0a0a] text-[#f5f5f0] font-['Montserrat'] overflow-x-hidden selection:bg-[#c9a227] selection:text-black">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
        
        .font-display { font-family: 'Cormorant Garamond', serif; }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-60px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .reveal { opacity: 0; transform: translateY(50px); transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
        .reveal-left { opacity: 0; transform: translateX(-80px); transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
        .reveal-right { opacity: 0; transform: translateX(80px); transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
        .reveal-scale { opacity: 0; transform: scale(0.9); transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        
        .active { opacity: 1 !important; transform: translate(0) scale(1) !important; }
        
        .text-gradient {
          background: linear-gradient(135deg, #c9a227 0%, #f4d47c 50%, #c9a227 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .nav-blur { backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        
        .btn-shine { position: relative; overflow: hidden; }
        .btn-shine::after {
          content: '';
          position: absolute;
          top: -50%; left: -100%; width: 50%; height: 200%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: rotate(25deg);
          transition: 0.5s;
        }
        .btn-shine:hover::after { left: 150%; }
      `}</style>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#0a0a0a]/95 border-b border-[#c9a227]/20 py-4' : 'bg-transparent py-6'} nav-blur`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 lg:w-12 lg:h-12 text-[#c9a227] transition-transform duration-500 group-hover:rotate-[360deg]">
              <Flame size="100%" />
            </div>
            <div>
              <span className="font-display text-2xl lg:text-3xl font-semibold tracking-wide text-[#f5f5f0]">Ember & Oak</span>
              <span className="block text-[10px] tracking-[0.3em] text-[#8a8578] uppercase">Fine Dining</span>
            </div>
          </a>

          <div className="hidden lg:flex items-center gap-10">
            {['HOME', 'ABOUT', 'MENU', 'GALLERY', 'RESERVATION'].map((link) => (
              <a 
                key={link} 
                href={`#${link.toLowerCase()}`}
                className="text-xs font-medium tracking-widest text-[#8a8578] hover:text-[#c9a227] transition-colors relative group"
              >
                {link}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#c9a227] transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>

          <div className="hidden lg:block">
            <a href="#reservation" className="btn-shine bg-[#c9a227] text-black px-6 py-3 text-xs font-bold tracking-widest rounded hover:bg-[#a68520] transition-colors">
              BOOK A TABLE
            </a>
          </div>

          <button className="lg:hidden text-[#f5f5f0]" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={28} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-[60] bg-[#0a0a0a] transition-transform duration-500 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex justify-between items-center mb-16">
            <span className="font-display text-2xl font-bold text-[#c9a227]">Ember & Oak</span>
            <button onClick={() => setMobileMenuOpen(false)}><X size={32} /></button>
          </div>
          <div className="flex flex-col gap-8">
            {['Home', 'About', 'Menu', 'Gallery', 'Reservation'].map((link) => (
              <a 
                key={link} 
                href={`#${link.toLowerCase()}`} 
                className="font-display text-4xl"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link}
              </a>
            ))}
          </div>
          <div className="mt-auto">
             <a href="#reservation" onClick={() => setMobileMenuOpen(false)} className="block text-center bg-[#c9a227] text-black py-4 font-bold tracking-widest rounded">
              BOOK A TABLE
            </a>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            ref={heroBgRef}
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80" 
            alt="Interior" 
            className="w-full h-[120%] object-cover opacity-60 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 via-[#0a0a0a]/40 to-[#0a0a0a]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-20">
          <div className="max-w-3xl">
            <span className="inline-block text-[#c9a227] font-medium tracking-[0.4em] text-sm mb-6 animate-[fadeInUp_0.8s_ease-out]">
              AUTHENTIC CULINARY EXPERIENCE
            </span>
            <h1 className="font-display text-5xl md:text-7xl lg:text-9xl font-semibold leading-none mb-8">
              <span className="block animate-[slideInLeft_1s_ease-out]">Where Fire</span>
              <span className="block text-gradient animate-[slideInLeft_1.2s_ease-out]">Meets Flavor</span>
            </h1>
            <p className="text-[#8a8578] text-lg lg:text-xl leading-relaxed mb-10 max-w-xl animate-[fadeInUp_1.4s_ease-out]">
              Experience the art of fine dining with locally sourced ingredients, open-fire cooking, and an atmosphere that ignites all your senses.
            </p>
            <div className="flex flex-wrap gap-6 animate-[fadeInUp_1.6s_ease-out]">
              <a href="#reservation" className="btn-shine bg-[#c9a227] text-black px-8 py-4 font-bold tracking-widest rounded flex items-center gap-2">
                RESERVE YOUR TABLE <ArrowRight size={18} />
              </a>
              <a href="#menu" className="border border-[#c9a227] text-[#c9a227] px-8 py-4 font-bold tracking-widest rounded hover:bg-[#c9a227] hover:text-black transition-all">
                EXPLORE MENU
              </a>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-50">
          <span className="text-[10px] tracking-[0.5em] uppercase">Scroll</span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-[#c9a227] to-transparent animate-pulse"></div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-20 items-center">
          <div className="reveal-left grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80" className="rounded-lg aspect-[3/4] object-cover w-full" alt="Chef" />
              <img src="https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80" className="rounded-lg aspect-square object-cover w-full" alt="Food" />
            </div>
            <div className="space-y-4 pt-12">
              <img src="https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&q=80" className="rounded-lg aspect-square object-cover w-full" alt="Bar" />
              <img src="https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=600&q=80" className="rounded-lg aspect-[3/4] object-cover w-full" alt="Interior" />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-[#141414] border border-[#2a2a2a] p-8 rounded-lg shadow-2xl hidden md:block">
              <div className="text-5xl font-display font-bold text-[#c9a227]">15+</div>
              <div className="text-xs tracking-widest text-[#8a8578]">YEARS OF EXCELLENCE</div>
            </div>
          </div>

          <div className="reveal-right">
            <span className="text-[#c9a227] font-medium tracking-[0.4em] text-xs">OUR STORY</span>
            <h2 className="font-display text-4xl lg:text-6xl font-bold mt-4 mb-8">
              A Legacy of <span className="text-gradient">Culinary Passion</span>
            </h2>
            <div className="w-16 h-[2px] bg-[#c9a227] mb-8"></div>
            <p className="text-[#8a8578] text-lg leading-relaxed mb-6">
              Founded in 2009, Ember & Oak emerged from a simple vision: to create a dining experience that celebrates the primal connection between fire and food. Our executive chef brings decades of expertise in open-fire cooking techniques.
            </p>
            <div className="grid grid-cols-2 gap-8 mb-10">
              <div className="flex gap-4">
                <div className="text-[#c9a227]"><Flame /></div>
                <div>
                  <h4 className="font-bold text-sm mb-1">Open Fire</h4>
                  <p className="text-xs text-[#8a8578]">Traditional techniques</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-[#c9a227]"><Globe /></div>
                <div>
                  <h4 className="font-bold text-sm mb-1">Local Sourcing</h4>
                  <p className="text-xs text-[#8a8578]">Farm to table</p>
                </div>
              </div>
            </div>
            <a href="#menu" className="inline-flex items-center gap-3 text-[#c9a227] font-bold tracking-widest text-sm hover:gap-5 transition-all">
              DISCOVER OUR MENU <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-24 lg:py-32 bg-[#141414]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <span className="text-[#c9a227] font-medium tracking-[0.4em] text-xs uppercase">Curated Selection</span>
            <h2 className="font-display text-4xl lg:text-6xl font-bold mt-4 mb-6">Our <span className="text-gradient">Signature</span> Dishes</h2>
            <p className="text-[#8a8578] max-w-2xl mx-auto">Crafted with passion using the finest seasonal ingredients.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-16 reveal active">
            {['all', 'starters', 'mains', 'desserts'].map(cat => (
              <button 
                key={cat}
                onClick={() => setCurrentFilter(cat)}
                className={`px-8 py-2 rounded-full border text-[10px] tracking-[0.2em] font-bold uppercase transition-all duration-300 ${
                  currentFilter === cat 
                    ? 'bg-[#c9a227] border-[#c9a227] text-black' 
                    : 'border-[#2a2a2a] text-[#8a8578] hover:border-[#c9a227] hover:text-[#c9a227]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]"> 
            {filteredMenu.map((item) => (
              <div 
                key={item.id} 
                className="reveal-scale active group bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-[#c9a227]/40 transition-all duration-500 animate-[fadeInUp_0.5s_ease-out]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-4 right-4 bg-[#c9a227] text-black font-bold px-3 py-1 rounded text-sm">
                    ${item.price}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-2xl font-bold mb-2 group-hover:text-[#c9a227] transition-colors">{item.name}</h3>
                  <p className="text-[#8a8578] text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-8 reveal">
            <div>
              <span className="text-[#c9a227] font-medium tracking-[0.4em] text-xs">VISUAL JOURNEY</span>
              <h2 className="font-display text-4xl lg:text-6xl font-bold mt-4">Moments at <span className="text-gradient">Ember & Oak</span></h2>
            </div>
            <p className="text-[#8a8578] max-w-sm">A glimpse into our world of culinary artistry and elegant ambiance.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[250px]">
            {galleryItems.map((item, i) => (
              <div key={i} className={`${item.span} overflow-hidden rounded-lg reveal-scale`}>
                <img src={item.image} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer" alt="Gallery" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 lg:py-32 bg-[#141414] overflow-hidden relative">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <span className="text-[#c9a227] font-medium tracking-[0.4em] text-xs">TESTIMONIALS</span>
          <h2 className="font-display text-4xl lg:text-6xl font-bold mt-4 mb-16">What Our <span className="text-gradient">Guests Say</span></h2>
          
          <div className="relative">
             <div 
              className="flex transition-transform duration-700 ease-in-out" 
              style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
            >
              {testimonials.map((t, i) => (
                <div key={i} className="w-full flex-shrink-0">
                  <div className="flex justify-center gap-1 mb-8 text-[#c9a227]">
                    {[...Array(t.rating)].map((_, j) => <Star key={j} fill="currentColor" size={20} />)}
                  </div>
                  <blockquote className="font-display text-2xl lg:text-4xl italic leading-relaxed mb-8">"{t.text}"</blockquote>
                  <p className="font-bold text-[#f5f5f0]">{t.name}</p>
                  <p className="text-[#8a8578] text-sm">{t.role}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center items-center gap-6 mt-12">
            <button 
              onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="p-3 border border-[#2a2a2a] rounded-full hover:border-[#c9a227] text-[#8a8578] hover:text-[#c9a227] transition-all"
            >
              <ChevronLeft />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-300 ${currentTestimonial === i ? 'w-8 bg-[#c9a227]' : 'w-2 bg-[#2a2a2a]'}`}
                />
              ))}
            </div>
            <button 
              onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
              className="p-3 border border-[#2a2a2a] rounded-full hover:border-[#c9a227] text-[#8a8578] hover:text-[#c9a227] transition-all"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </section>

      {/* Reservation Section */}
      <section id="reservation" className="py-24 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-20">
          <div className="reveal-left">
            <span className="text-[#c9a227] font-medium tracking-[0.4em] text-xs">RESERVATIONS</span>
            <h2 className="font-display text-4xl lg:text-6xl font-bold mt-4 mb-8 leading-tight">Book Your <span className="text-gradient">Table</span></h2>
            <p className="text-[#8a8578] text-lg mb-12">Reserve your spot for an unforgettable dining experience. Every detail is perfect.</p>
            
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-lg bg-[#c9a227]/10 flex items-center justify-center text-[#c9a227]"><MapPin /></div>
                <div><h4 className="font-bold">Location</h4><p className="text-sm text-[#8a8578]"> RC7X+CW4, Tehsil Rd, Okara, Punjab</p></div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-lg bg-[#c9a227]/10 flex items-center justify-center text-[#c9a227]"><Clock /></div>
                <div><h4 className="font-bold">Hours</h4><p className="text-sm text-[#8a8578]">Tue - Sun: 5:00 PM - 11:00 PM</p></div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-lg bg-[#c9a227]/10 flex items-center justify-center text-[#c9a227]"><Phone /></div>
                <div><h4 className="font-bold">Contact</h4><p className="text-sm text-[#8a8578]">+92 328 6930517</p></div>
              </div>
            </div>
          </div>

          <div className="reveal-right">
            <form onSubmit={handleReservation} className="bg-[#141414] border border-[#2a2a2a] p-8 md:p-12 rounded-2xl shadow-2xl">
              <h3 className="font-display text-2xl font-bold mb-8">Make a Reservation</h3>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <input required name="fullName" type="text" placeholder="Full Name" className="bg-[#0a0a0a] border border-[#2a2a2a] p-4 rounded-lg focus:outline-none focus:border-[#c9a227] transition-colors" />
                <input required name="email" type="email" placeholder="Email Address" className="bg-[#0a0a0a] border border-[#2a2a2a] p-4 rounded-lg focus:outline-none focus:border-[#c9a227] transition-colors" />
              </div>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <select required name="guests" className="bg-[#0a0a0a] border border-[#2a2a2a] p-4 rounded-lg focus:outline-none focus:border-[#c9a227] transition-colors text-[#8a8578]">
                  <option value="">Guests</option>
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n} className="text-[#f5f5f0]">{n} Guests</option>)}
                  <option value="7+" className="text-[#f5f5f0]">7+ Guests</option>
                </select>
                <input required name="reservationDate" type="date" className="bg-[#0a0a0a] border border-[#2a2a2a] p-4 rounded-lg focus:outline-none focus:border-[#c9a227] transition-colors text-[#8a8578]" />
              </div>
              <textarea name="specialRequests" placeholder="Special Requests" rows="4" className="w-full bg-[#0a0a0a] border border-[#2a2a2a] p-4 rounded-lg focus:outline-none focus:border-[#c9a227] transition-colors mb-8 resize-none"></textarea>
              <button disabled={isSubmitting} type="submit" className={`btn-shine w-full bg-[#c9a227] text-black py-5 font-bold tracking-[0.2em] rounded-lg transition-transform active:scale-95 flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {isSubmitting ? 'SAVING...' : 'CONFIRM RESERVATION'} <Check size={20} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#141414] border-t border-[#2a2a2a] pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="text-[#c9a227]"><Flame size={32} /></div>
              <span className="font-display text-2xl font-bold">Ember & Oak</span>
            </div>
            <p className="text-[#8a8578] text-sm leading-relaxed mb-8">Where fire meets flavor. Join us for a journey of culinary excellence and artisanal techniques.</p>
            <div className="flex gap-4">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full border border-[#2a2a2a] flex items-center justify-center text-[#8a8578] hover:border-[#c9a227] hover:text-[#c9a227] transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display text-xl font-bold mb-8">Quick Links</h4>
            <ul className="space-y-4 text-sm text-[#8a8578]">
              {['Home', 'About', 'Menu', 'Gallery', 'Reservation'].map(l => <li key={l}><a href={`#${l.toLowerCase()}`} className="hover:text-[#c9a227] transition-colors">{l}</a></li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-xl font-bold mb-8">Hours</h4>
            <ul className="space-y-4 text-sm text-[#8a8578]">
              <li className="flex justify-between"><span>Tue - Thu</span> <span className="text-[#f5f5f0]">5PM - 10PM</span></li>
              <li className="flex justify-between"><span>Fri - Sat</span> <span className="text-[#f5f5f0]">5PM - 11PM</span></li>
              <li className="flex justify-between"><span>Sunday</span> <span className="text-[#f5f5f0]">4PM - 9PM</span></li>
              <li className="flex justify-between"><span>Monday</span> <span className="text-[#c9a227]">CLOSED</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-xl font-bold mb-8">Newsletter</h4>
            <p className="text-sm text-[#8a8578] mb-6">Subscribe for exclusive offers and updates.</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your email" className="bg-[#0a0a0a] border border-[#2a2a2a] px-4 py-3 rounded-lg flex-1 text-sm focus:outline-none focus:border-[#c9a227]" />
              <button className="bg-[#c9a227] text-black px-4 rounded-lg hover:bg-[#a68520] transition-colors"><Mail size={18} /></button>
            </form>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-10 border-t border-[#2a2a2a] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#8a8578] tracking-widest">
          <p>© 2025 EMBER & OAK. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-[#c9a227]">PRIVACY POLICY</a>
            <a href="#" className="hover:text-[#c9a227]">TERMS OF SERVICE</a>
          </div>
        </div>
      </footer>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-md" onClick={() => setShowSuccessModal(false)}></div>
          <div className="relative bg-[#141414] border border-[#c9a227] rounded-2xl p-10 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-[#c9a227]/20 text-[#c9a227] rounded-full flex items-center justify-center mx-auto mb-8">
              <Check size={40} />
            </div>
            <h3 className="font-display text-3xl font-bold mb-4">Confirmed!</h3>
            <p className="text-[#8a8578] mb-8 leading-relaxed">Thank you for your reservation. We've sent a confirmation email to {user?.email || 'you'} and notified the owner. See you soon!</p>
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="bg-[#c9a227] text-black w-full py-4 font-bold tracking-widest rounded-lg"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}