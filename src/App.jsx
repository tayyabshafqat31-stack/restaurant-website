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
  Mail,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Truck
} from 'lucide-react';

// Firebase Imports
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// --- Firebase Configuration ---
// Use environment variables if available, otherwise fallback to hardcoded (though environment is preferred to avoid token mismatch)
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {
      apiKey: "AIzaSyBskIUexXZR0m4txgGm5CWk1oETW5ygZdg",
      authDomain: "ember-oak-e4c45.firebaseapp.com",
      projectId: "ember-oak-e4c45",
      storageBucket: "ember-oak-e4c45.firebasestorage.app",
      messagingSenderId: "314291658657",
      appId: "1:314291658657:web:54fa4d2e783cbd03aeb5e0"
    };

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'ember-oak-e4c45';

// --- Data ---
const menuItems = [
  { id: 1, name: 'Finger Fish', category: 'starters', price: 4, description: 'Crispy golden fish strips, served with tartar sauce and lemon wedges', image: 'fish.jpg' },
  { id: 2, name: 'Chicken Dumplings', category: 'starters', price: 4, description: 'Hand-crafted dumplings filled with seasoned chicken, ginger soy dipping sauce', image: 'dumpling.jpg' },
  { id: 3, name: 'Creamy Chicken Soup', category: 'starters', price: 6, description: 'Rich and comforting chicken soup with vegetables and fresh herbs', image: 'soup.jpg' },
  { id: 4, name: 'Beef Steak', category: 'mains', price: 8, description: '28-day dry-aged ribeye, bone marrow butter, roasted shallots', image: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=600&q=80' },
  { id: 5, name: 'Signature Pizza', category: 'mains', price: 10, description: 'Crispy thin crust topped with roasted duck, hoisin sauce, mozzarella, and scallions', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80' },
  { id: 6, name: 'Chicken Broast', category: 'mains', price: 10, description: 'Pressure-fried golden chicken, juicy inside and crispy outside, served with fries and coleslaw', image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&q=80' },
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
  { name: 'Sarah Mitchell', role: 'Food Critic', text: 'Ember & Oak redefined fine dining for me. The finger fish was absolutely exceptional - perfectly crispy outside, tender inside.', rating: 5 },
  { name: 'James Chen', role: 'Regular Guest', text: 'Every visit feels like coming home to luxury. The chicken dumplings are the best I have ever had.', rating: 5 },
  { name: 'Emily Rodriguez', role: 'Wine Enthusiast', text: 'The creamy chicken soup warmed my soul on a cold evening. A journey through flavors.', rating: 5 }
];

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(null); // 'reservation' or 'order'
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' or 'delivery'
  const heroBgRef = useRef(null);

  // --- Firebase Auth ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          try {
            await signInWithCustomToken(auth, __initial_auth_token);
          } catch (tokenError) {
            // If custom token fails (like a mismatch), fallback to anonymous
            await signInAnonymously(auth);
          }
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Critical Auth failure:", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // --- Effects ---
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
        if (entry.isIntersecting) entry.target.classList.add('active');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => observer.observe(el));
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const filteredMenu = useMemo(() => {
    return currentFilter === 'all' ? menuItems : menuItems.filter(item => item.category === currentFilter);
  }, [currentFilter]);

  // --- Cart Logic ---
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // --- Handlers ---
  const handleReservation = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const data = {
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      guests: formData.get('guests'),
      reservationDate: formData.get('reservationDate'),
      specialRequests: formData.get('specialRequests'),
      createdAt: serverTimestamp(),
      userId: user.uid
    };
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'reservations'), data);
      setShowSuccessModal('reservation');
      e.target.reset();
    } catch (err) { console.error("Reservation Error:", err); }
    finally { setIsSubmitting(false); }
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!user || cart.length === 0) return;
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const orderData = {
      customerName: formData.get('name'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      items: cart,
      total: cartTotal,
      status: 'pending',
      createdAt: serverTimestamp(),
      userId: user.uid
    };
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), orderData);
      setCart([]);
      setIsCartOpen(false);
      setCheckoutStep('cart');
      setShowSuccessModal('order');
    } catch (err) { console.error("Order Error:", err); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="bg-[#0a0a0a] text-[#f5f5f0] font-['Montserrat'] overflow-x-hidden selection:bg-[#c9a227] selection:text-black">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Cormorant Garamond', serif; }
        .reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s ease-out; }
        .reveal-left { opacity: 0; transform: translateX(-50px); transition: all 0.8s ease-out; }
        .reveal-right { opacity: 0; transform: translateX(50px); transition: all 0.8s ease-out; }
        .reveal-scale { opacity: 0; transform: scale(0.95); transition: all 0.8s ease-out; }
        .active { opacity: 1 !important; transform: none !important; }
        .text-gradient { background: linear-gradient(135deg, #c9a227 0%, #f4d47c 50%, #c9a227 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .nav-blur { backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
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
              <a key={link} href={`#${link.toLowerCase()}`} className="text-xs font-medium tracking-widest text-[#8a8578] hover:text-[#c9a227] transition-colors relative group">
                {link}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#c9a227] transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#c9a227] hover:scale-110 transition-transform"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
            <div className="hidden lg:block">
              <a href="#reservation" className="bg-[#c9a227] text-black px-6 py-3 text-xs font-bold tracking-widest rounded hover:bg-[#a68520] transition-colors">
                BOOK A TABLE
              </a>
            </div>
            <button className="lg:hidden text-[#f5f5f0]" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* Cart Drawer */}
      <div className={`fixed inset-0 z-[100] transition-all duration-500 ${isCartOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsCartOpen(false)} />
        <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-[#0a0a0a] border-l border-[#2a2a2a] shadow-2xl transition-transform duration-500 transform ${isCartOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
          <div className="p-6 border-b border-[#2a2a2a] flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold flex items-center gap-3">
              {checkoutStep === 'delivery' ? <Truck className="text-[#c9a227]" /> : <ShoppingCart className="text-[#c9a227]" />}
              {checkoutStep === 'delivery' ? 'Delivery Details' : 'Your Order'}
            </h2>
            <button onClick={() => { setIsCartOpen(false); setCheckoutStep('cart'); }} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            {checkoutStep === 'cart' ? (
              <>
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <ShoppingCart size={64} className="mb-4" />
                    <p className="text-xl font-display">Your cart is empty</p>
                    <p className="text-sm mt-2">Explore our menu and add some flavors!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex gap-4 items-center">
                        <img src={item.image} className="w-20 h-20 object-cover rounded-lg" alt={item.name} />
                        <div className="flex-1">
                          <h4 className="font-bold text-[#f5f5f0]">{item.name}</h4>
                          <p className="text-[#c9a227] font-bold text-sm">${item.price}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center border border-[#2a2a2a] rounded overflow-hidden">
                              <button onClick={() => updateQuantity(item.id, -1)} className="p-1 px-2 hover:bg-white/5"><Minus size={14} /></button>
                              <span className="px-3 text-sm font-bold">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="p-1 px-2 hover:bg-white/5"><Plus size={14} /></button>
                            </div>
                            <button onClick={() => updateQuantity(item.id, -item.quantity)} className="text-red-500/60 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                          </div>
                        </div>
                        <div className="text-right font-bold text-lg">
                          ${item.price * item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <form id="order-form" onSubmit={handleOrder} className="space-y-6">
                <div>
                  <label className="block text-xs tracking-widest text-[#8a8578] uppercase mb-2">Full Name</label>
                  <input required name="name" type="text" className="w-full bg-[#141414] border border-[#2a2a2a] p-4 rounded-lg focus:border-[#c9a227] outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs tracking-widest text-[#8a8578] uppercase mb-2">Phone Number</label>
                  <input required name="phone" type="tel" className="w-full bg-[#141414] border border-[#2a2a2a] p-4 rounded-lg focus:border-[#c9a227] outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs tracking-widest text-[#8a8578] uppercase mb-2">Delivery Address</label>
                  <textarea required name="address" rows="3" className="w-full bg-[#141414] border border-[#2a2a2a] p-4 rounded-lg focus:border-[#c9a227] outline-none transition-colors resize-none"></textarea>
                </div>
                <div className="p-4 bg-[#c9a227]/10 border border-[#c9a227]/20 rounded-lg flex items-start gap-3">
                  <Clock className="text-[#c9a227] mt-1" size={18} />
                  <p className="text-xs text-[#8a8578] leading-relaxed">
                    Estimated delivery time: <span className="text-[#f5f5f0] font-bold">30-45 minutes</span>. Payment will be collected as Cash on Delivery.
                  </p>
                </div>
              </form>
            )}
          </div>

          <div className="p-6 border-t border-[#2a2a2a] bg-[#0d0d0d]">
            <div className="flex justify-between items-end mb-6">
              <span className="text-[#8a8578] uppercase tracking-widest text-xs">Total Amount</span>
              <span className="text-3xl font-display font-bold text-[#c9a227]">${cartTotal}</span>
            </div>
            
            {checkoutStep === 'cart' ? (
              <button 
                disabled={cart.length === 0}
                onClick={() => setCheckoutStep('delivery')}
                className="w-full bg-[#c9a227] text-black py-4 rounded-lg font-bold tracking-widest hover:bg-[#a68520] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                ORDER FOR DELIVERY <Truck size={20} />
              </button>
            ) : (
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setCheckoutStep('cart')}
                  className="flex-1 border border-[#2a2a2a] py-4 rounded-lg font-bold tracking-widest hover:bg-white/5 transition-all"
                >
                  BACK
                </button>
                <button 
                  type="submit"
                  form="order-form"
                  disabled={isSubmitting}
                  className="flex-[2] bg-[#c9a227] text-black py-4 rounded-lg font-bold tracking-widest hover:bg-[#a68520] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'PLACING ORDER...' : 'CONFIRM ORDER'}
                </button>
              </div>
            )}
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
              <span className="block">Where Fire</span>
              <span className="block text-gradient">Meets Flavor</span>
            </h1>
            <p className="text-[#8a8578] text-lg lg:text-xl leading-relaxed mb-10 max-w-xl">
              Experience the art of fine dining with locally sourced ingredients and open-fire cooking that ignites all your senses.
            </p>
            <div className="flex flex-wrap gap-6">
              <a href="#reservation" className="bg-[#c9a227] text-black px-8 py-4 font-bold tracking-widest rounded flex items-center gap-2 hover:bg-[#a68520] transition-colors">
                RESERVE YOUR TABLE <ArrowRight size={18} />
              </a>
              <button onClick={() => { document.getElementById('menu').scrollIntoView({ behavior: 'smooth' }); }} className="border border-[#c9a227] text-[#c9a227] px-8 py-4 font-bold tracking-widest rounded hover:bg-[#c9a227] hover:text-black transition-all">
                ORDER NOW
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-24 lg:py-32 bg-[#141414]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16 reveal active">
            <span className="text-[#c9a227] font-medium tracking-[0.4em] text-xs uppercase">Curated Selection</span>
            <h2 className="font-display text-4xl lg:text-6xl font-bold mt-4 mb-6">Our <span className="text-gradient">Signature</span> Dishes</h2>
            <p className="text-[#8a8578] max-w-2xl mx-auto">Crafted with passion using the finest seasonal ingredients. Order for delivery or dine in.</p>
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
                className="reveal-scale active group bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-[#c9a227]/40 transition-all duration-500"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-4 right-4 bg-[#c9a227] text-black font-bold px-3 py-1 rounded text-sm">
                    ${item.price}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-2xl font-bold mb-2 group-hover:text-[#c9a227] transition-colors">{item.name}</h3>
                  <p className="text-[#8a8578] text-sm leading-relaxed mb-6">{item.description}</p>
                  <button 
                    onClick={() => addToCart(item)}
                    className="w-full flex items-center justify-center gap-2 border border-[#2a2a2a] group-hover:border-[#c9a227] group-hover:bg-[#c9a227] group-hover:text-black py-3 rounded text-xs font-bold tracking-widest transition-all"
                  >
                    ADD TO CART <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reservation Section */}
      <section id="reservation" className="py-24 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-20">
          <div className="reveal-left active">
            <span className="text-[#c9a227] font-medium tracking-[0.4em] text-xs uppercase">Reservations</span>
            <h2 className="font-display text-4xl lg:text-6xl font-bold mt-4 mb-8 leading-tight">Book Your <span className="text-gradient">Table</span></h2>
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-lg bg-[#c9a227]/10 flex items-center justify-center text-[#c9a227]"><MapPin /></div>
                <div><h4 className="font-bold">Location</h4><p className="text-sm text-[#8a8578]">Tehsil Rd, Okara, Punjab</p></div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-lg bg-[#c9a227]/10 flex items-center justify-center text-[#c9a227]"><Clock /></div>
                <div><h4 className="font-bold">Hours</h4><p className="text-sm text-[#8a8578]">Tue - Sun: 5:00 PM - 11:00 PM</p></div>
              </div>
            </div>
          </div>

          <div className="reveal-right active">
            <form onSubmit={handleReservation} className="bg-[#141414] border border-[#2a2a2a] p-8 md:p-12 rounded-2xl shadow-2xl">
              <h3 className="font-display text-2xl font-bold mb-8">Dine-in Reservation</h3>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <input required name="fullName" type="text" placeholder="Full Name" className="bg-[#0a0a0a] border border-[#2a2a2a] p-4 rounded-lg focus:outline-none focus:border-[#c9a227] transition-colors" />
                <input required name="email" type="email" placeholder="Email Address" className="bg-[#0a0a0a] border border-[#2a2a2a] p-4 rounded-lg focus:outline-none focus:border-[#c9a227] transition-colors" />
              </div>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <select required name="guests" className="bg-[#0a0a0a] border border-[#2a2a2a] p-4 rounded-lg focus:outline-none focus:border-[#c9a227] text-[#8a8578]">
                  <option value="">Number of Guests</option>
                  {[1,2,3,4,5,6, '7+'].map(n => <option key={n} value={n}>{n} Guests</option>)}
                </select>
                <input required name="reservationDate" type="date" className="bg-[#0a0a0a] border border-[#2a2a2a] p-4 rounded-lg focus:outline-none focus:border-[#c9a227] text-[#8a8578]" />
              </div>
              <textarea name="specialRequests" placeholder="Special Requests" rows="4" className="w-full bg-[#0a0a0a] border border-[#2a2a2a] p-4 rounded-lg focus:outline-none focus:border-[#c9a227] mb-8 resize-none"></textarea>
              <button disabled={isSubmitting} type="submit" className="w-full bg-[#c9a227] text-black py-5 font-bold tracking-[0.2em] rounded-lg hover:bg-[#a68520] transition-all disabled:opacity-50">
                {isSubmitting ? 'PROCESSING...' : 'CONFIRM RESERVATION'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#141414] border-t border-[#2a2a2a] pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-[#c9a227]"><Flame size={32} /></div>
              <span className="font-display text-2xl font-bold">Ember & Oak</span>
            </div>
            <p className="text-[#8a8578] text-sm leading-relaxed mb-8">Redefining the open-fire culinary experience with tradition and modern artistry.</p>
            <div className="flex gap-4">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full border border-[#2a2a2a] flex items-center justify-center text-[#8a8578] hover:border-[#c9a227] hover:text-[#c9a227] transition-all"><Icon size={18} /></a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display text-xl font-bold mb-8">Menu Highlights</h4>
            <ul className="space-y-4 text-sm text-[#8a8578]">
              <li>Finger Fish</li>
              <li>Chicken Dumplings</li>
              <li>Signature Pizza</li>
              <li>Beef Steak</li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-xl font-bold mb-8">Hours</h4>
            <ul className="space-y-4 text-sm text-[#8a8578]">
              <li className="flex justify-between"><span>Tue - Sat</span> <span className="text-[#f5f5f0]">5PM - 11PM</span></li>
              <li className="flex justify-between"><span>Sunday</span> <span className="text-[#f5f5f0]">4PM - 10PM</span></li>
              <li className="flex justify-between"><span>Monday</span> <span className="text-[#c9a227]">CLOSED</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-xl font-bold mb-8">Order Online</h4>
            <p className="text-sm text-[#8a8578] mb-6">Get your favorite dishes delivered straight to your door.</p>
            <button onClick={() => { document.getElementById('menu').scrollIntoView({ behavior: 'smooth' }); }} className="w-full bg-[#c9a227] text-black py-3 rounded-lg font-bold text-xs tracking-widest hover:bg-[#a68520] transition-colors">
              VIEW DELIVERY MENU
            </button>
          </div>
        </div>
      </footer>

      {/* Success Modals */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="relative bg-[#141414] border border-[#c9a227] rounded-2xl p-10 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-[#c9a227]/20 text-[#c9a227] rounded-full flex items-center justify-center mx-auto mb-8">
              <Check size={40} />
            </div>
            <h3 className="font-display text-3xl font-bold mb-4">
              {showSuccessModal === 'reservation' ? 'Reservation Confirmed!' : 'Order Placed!'}
            </h3>
            <p className="text-[#8a8578] mb-8 leading-relaxed">
              {showSuccessModal === 'reservation' 
                ? 'Thank you for choosing Ember & Oak. We have reserved your table and look forward to serving you soon.'
                : 'Your order has been received! Our chefs are preparing your meal, and our rider will be with you shortly.'}
            </p>
            <button onClick={() => setShowSuccessModal(null)} className="bg-[#c9a227] text-black w-full py-4 font-bold tracking-widest rounded-lg">
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* Floating Cart Button (Mobile Only) */}
      <button 
        onClick={() => setIsCartOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-[40] bg-[#c9a227] text-black w-16 h-16 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
      >
        <ShoppingCart size={28} />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-white text-black border-2 border-[#c9a227] text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-bold">
            {cartCount}
          </span>
        )}
      </button>
    </div>
  );
}