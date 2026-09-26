import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  MapPin, 
  Droplets, 
  Activity, 
  ShieldCheck, 
  ArrowRight, 
  Bell, 
  Compass 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: MapPin,
      title: 'Geospatial Vulnerability Map',
      description: 'Dynamic GeoJSON polygon mapping visualizing real-time risk scores across all 64 districts in Bangladesh.',
      color: 'bg-rose-50 text-rose-600 border-rose-200'
    },
    {
      icon: Droplets,
      title: 'River Station Flood Forecast',
      description: 'Monitors real-time water levels against official danger marks with predictive 24h & 48h water level projections.',
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      icon: Activity,
      title: 'Real-Time USGS Seismic Tracker',
      description: 'Live seismic tracking detecting magnitude, depth, and epicenters within Bangladesh and neighboring fault zones.',
      color: 'bg-amber-50 text-amber-600 border-amber-200'
    },
    {
      icon: ShieldCheck,
      title: 'Emergency Shelters & Mutual Aid',
      description: 'Instant GPS-based discovery of nearest open cyclone and flood shelters, plus real-time resource demand requests.',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Personalize Your Area',
      desc: 'Sign up and select your home and followed Upazilas to receive targeted alerts.'
    },
    {
      step: '02',
      title: 'Receive Real-Time Warnings',
      desc: 'Get automated warnings via Socket.io & email whenever river thresholds or seismic limits are breached.'
    },
    {
      step: '03',
      title: 'Coordinate & Stay Safe',
      desc: 'Find the nearest shelters, request urgent relief supplies, or file verified citizen disaster reports.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-950 text-white py-20 lg:py-28">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>National Early Warning & Response System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            Stay Prepared, <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">Stay Safe.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            DURJOG provides automated early warnings, real-time flood gauges, USGS seismic feeds, and community coordination for the citizens of Bangladesh.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition duration-200"
            >
              <span>Explore Live Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {!user ? (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold rounded-xl border border-slate-700 backdrop-blur-sm transition duration-200"
              >
                <span>Register for Alerts</span>
                <Bell className="w-4 h-4 text-blue-400" />
              </Link>
            ) : (
              <Link
                to="/shelters"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold rounded-xl border border-slate-700 backdrop-blur-sm transition duration-200"
              >
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>Find Nearby Shelters</span>
              </Link>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 pt-10 border-t border-slate-800/60 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-sky-400">64</div>
              <div className="text-xs text-slate-400 uppercase font-semibold mt-1">Districts Tracked</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-400">495</div>
              <div className="text-xs text-slate-400 uppercase font-semibold mt-1">Upazilas Covered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-400">24/7</div>
              <div className="text-xs text-slate-400 uppercase font-semibold mt-1">Automated Monitoring</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-400">&lt; 1 sec</div>
              <div className="text-xs text-slate-400 uppercase font-semibold mt-1">Socket.io Alert Delivery</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase font-bold tracking-widest text-blue-600 mb-2">Integrated Platform</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            A Multi-Hazard Early Warning Network
          </p>
          <p className="text-slate-600 mt-3 text-base">
            Engineered specifically to tackle the frequent monsoon floods, river overflows, and tectonic hazards across Bangladesh.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 border ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works steps */}
      <section className="py-16 bg-slate-100 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">How DURJOG Protects Communities</h2>
            <p className="text-slate-600 text-sm mt-2">Continuous data collection, automated scoring, and instant communication.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((st, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 relative">
                <div className="text-4xl font-extrabold text-blue-100 mb-2">{st.step}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{st.title}</h3>
                <p className="text-sm text-slate-600">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community CTA */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold">Ready to Join the Early Warning Network?</h2>
          <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
            Stay informed with real-time alerts tailored to your home district and upazila.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to={user ? "/profile" : "/register"}
              className="px-8 py-3.5 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition shadow"
            >
              {user ? "Configure Alert Preferences" : "Get Started for Free"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;