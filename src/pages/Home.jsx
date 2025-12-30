import { Link } from 'react-router-dom'
import { FileText, Search, Shield, CheckCircle, Clock, Users } from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: FileText,
      title: 'Submit Complaints',
      description: 'Easily submit your concerns through our streamlined complaint form. Anonymous submissions are welcome.',
      color: 'bg-maroon-800',
    },
    {
      icon: Shield,
      title: 'Verified Process',
      description: 'All complaints are verified by the VP Admin to ensure legitimacy before being forwarded to departments.',
      color: 'bg-gold-600',
    },
    {
      icon: Clock,
      title: 'Track Progress',
      description: 'Monitor your complaint status in real-time using your unique reference number.',
      color: 'bg-maroon-800',
    },
    {
      icon: CheckCircle,
      title: 'Resolution Focused',
      description: 'Dedicated department officers work to resolve your concerns efficiently and effectively.',
      color: 'bg-gold-600',
    },
  ]

  const steps = [
    { number: '01', title: 'Submit', description: 'Fill out the complaint form with your concerns' },
    { number: '02', title: 'Verify', description: 'Admin reviews and verifies your complaint' },
    { number: '03', title: 'Assign', description: 'Complaint is forwarded to the relevant department' },
    { number: '04', title: 'Resolve', description: 'Department works on resolution and updates status' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-maroon-800 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gold-500 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold-500 rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-maroon-700 px-4 py-2 rounded-full mb-6">
              <Users size={18} className="text-gold-400" />
              <span className="text-sm text-gold-300">Liceo Community Portal</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Your Voice <span className="text-gold-400">Matters</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              Liceo 8888 is your dedicated platform for submitting and tracking complaints. 
              We ensure every concern is heard, verified, and resolved efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/submit"
                className="inline-flex items-center justify-center space-x-2 bg-gold-500 text-maroon-900 px-8 py-4 rounded-xl font-semibold hover:bg-gold-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <FileText size={20} />
                <span>Submit a Complaint</span>
              </Link>
              <Link
                to="/track"
                className="inline-flex items-center justify-center space-x-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-maroon-800 transition-all duration-200"
              >
                <Search size={20} />
                <span>Track Your Complaint</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Use <span className="text-maroon-800">Liceo 8888</span>?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our complaint management system is designed to provide a transparent and efficient way to address your concerns.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gold-300"
              >
                <div className={`${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It <span className="text-gold-600">Works</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A simple four-step process to get your concerns addressed
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                  <span className="text-5xl font-bold text-maroon-100">{step.number}</span>
                  <h3 className="text-xl font-semibold text-maroon-800 mt-2 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gold-400"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-maroon-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Submit Your Concern?
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Your feedback helps us improve. Submit your complaint today and let us work together to make Liceo better.
          </p>
          <Link
            to="/submit"
            className="inline-flex items-center space-x-2 bg-gold-500 text-maroon-900 px-8 py-4 rounded-xl font-semibold hover:bg-gold-400 transition-all duration-200 shadow-lg"
          >
            <FileText size={20} />
            <span>Get Started Now</span>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
