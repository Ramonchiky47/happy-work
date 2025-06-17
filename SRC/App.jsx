// App.jsx - Happy Work con Firebase
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';

// ⚠️ REEMPLAZA ESTA CONFIGURACIÓN CON LA TUYA DE FIREBASE
// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA2GgybljrwKJCHa6dzmE3W5K38chmCdIo",
  authDomain: "happy-work-clima.firebaseapp.com",
  projectId: "happy-work-clima",
  storageBucket: "happy-work-clima.appspot.com",
  messagingSenderId: "293122664855",
  appId: "1:293122664855:web:4bd8887dd6c5b1a3097cd2"
};


// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('Ramon.2025&');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    plaza: '',
    satisfaccionGeneral: 0,
    ambiente: 0,
    comunicacion: 0,
    reconocimiento: 0,
    desarrolloProfesional: 0,
    equilibrioVida: 0,
    inquietudes: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  const plazas = ['Guadalajara', 'México', 'Monterrey', 'León', 'Querétaro', 'Noroeste'];
  
  const preguntas = [
    { key: 'satisfaccionGeneral', label: '¿Qué tan satisfecho te sientes con tu trabajo actual?' },
    { key: 'ambiente', label: '¿Cómo calificarías el ambiente de trabajo en tu área?' },
    { key: 'comunicacion', label: '¿Cómo evalúas la comunicación con tu supervisor directo?' },
    { key: 'reconocimiento', label: '¿Sientes que tu trabajo es reconocido y valorado?' },
    { key: 'desarrolloProfesional', label: '¿Consideras que tienes oportunidades de crecimiento profesional?' },
    { key: 'equilibrioVida', label: '¿Cómo calificarías el equilibrio entre tu vida personal y laboral?' }
  ];

  // Cargar respuestas de Firebase
  const loadResponses = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'responses'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const loadedResponses = [];
      querySnapshot.forEach((doc) => {
        loadedResponses.push({ id: doc.id, ...doc.data() });
      });
      setResponses(loadedResponses);
    } catch (error) {
      console.error('Error cargando respuestas:', error);
      alert('Error cargando datos. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  // Guardar respuesta en Firebase
  const saveResponse = async (responseData) => {
    try {
      setLoading(true);
      await addDoc(collection(db, 'responses'), responseData);
      await loadResponses(); // Recargar datos
    } catch (error) {
      console.error('Error guardando respuesta:', error);
      alert('Error guardando la encuesta. Intenta de nuevo.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al iniciar
  useEffect(() => {
    loadResponses();
    
    // Cargar contraseña admin de localStorage
    const savedPassword = localStorage.getItem('happyWorkAdminPassword');
    if (savedPassword) {
      setAdminPassword(savedPassword);
    }
  }, []);

  // Star Rating Component
  const StarRating = ({ rating, onRatingChange, questionKey }) => {
    const [hover, setHover] = useState(0);

    return (
      <div className="flex space-x-1">
        {[...Array(5)].map((star, index) => {
          const ratingValue = index + 1;
          return (
            <button
              key={index}
              type="button"
              className={`text-3xl transition-colors ${
                ratingValue <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'
              } hover:text-yellow-400`}
              onClick={() => onRatingChange(questionKey, ratingValue)}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(0)}
            >
              ★
            </button>
          );
        })}
      </div>
    );
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // Validaciones
    const requiredFields = ['plaza'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    const unansweredQuestions = preguntas.filter(pregunta => formData[pregunta.key] === 0);
    
    if (missingFields.length > 0 || unansweredQuestions.length > 0) {
      alert('Por favor completa la selección de plaza y califica todas las preguntas.');
      return;
    }

    try {
      // Preparar datos para Firebase
      const responseData = {
        ...formData,
        timestamp: new Date().toISOString(),
        fechaCreacion: new Date()
      };

      await saveResponse(responseData);
      
      // Reset form
      setFormData({
        plaza: '',
        satisfaccionGeneral: 0,
        ambiente: 0,
        comunicacion: 0,
        reconocimiento: 0,
        desarrolloProfesional: 0,
        equilibrioVida: 0,
        inquietudes: '',
        fecha: new Date().toISOString().split('T')[0]
      });

      setCurrentView('thanks');
      
      // Auto close after 3 seconds
      setTimeout(() => {
        window.close();
      }, 3000);
      
    } catch (error) {
      // Error ya manejado en saveResponse
    }
  };

  const handleAdminLogin = () => {
    if (password === adminPassword) {
      setIsAdmin(true);
      setCurrentView('dashboard');
      setPassword('');
    } else {
      alert('Contraseña incorrecta');
      setPassword('');
    }
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    if (newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    localStorage.setItem('happyWorkAdminPassword', newPassword);
    setAdminPassword(newPassword);
    setNewPassword('');
    setConfirmPassword('');
    alert('Contraseña actualizada exitosamente');
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentView('home');
  };

  // Analytics calculations
  const getAnalytics = () => {
    if (responses.length === 0) return null;

    const byPlaza = responses.reduce((acc, resp) => {
      acc[resp.plaza] = (acc[resp.plaza] || 0) + 1;
      return acc;
    }, {});

    const avgScores = preguntas.map(pregunta => {
      const scores = responses.map(resp => resp[pregunta.key] || 0);
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      return {
        pregunta: pregunta.label.substring(0, 30) + '...',
        promedio: avg.toFixed(1)
      };
    });

    const satisfactionDist = responses.reduce((acc, resp) => {
      const stars = resp.satisfaccionGeneral;
      const label = `${stars} estrella${stars !== 1 ? 's' : ''}`;
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    return {
      totalResponses: responses.length,
      byPlaza: Object.entries(byPlaza).map(([plaza, count]) => ({ plaza, count })),
      avgScores,
      satisfactionDist: Object.entries(satisfactionDist).map(([name, value]) => ({ name, value }))
    };
  };

  const analytics = getAnalytics();

  // Loading Component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span className="ml-2">Cargando...</span>
    </div>
  );

  // Home View
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-800 to-red-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-700 to-red-800 p-8 text-center relative">
              {/* Sol con lentes */}
              <div className="absolute top-4 right-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-yellow-300 rounded-full relative animate-pulse">
                    {/* Rayos del sol */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-yellow-300 rounded"></div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-yellow-300 rounded"></div>
                    <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-1 bg-yellow-300 rounded"></div>
                    <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-1 bg-yellow-300 rounded"></div>
                    <div className="absolute top-1 left-1 w-2 h-2 bg-yellow-300 rounded transform rotate-45"></div>
                    <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-300 rounded transform rotate-45"></div>
                    <div className="absolute bottom-1 left-1 w-2 h-2 bg-yellow-300 rounded transform rotate-45"></div>
                    <div className="absolute bottom-1 right-1 w-2 h-2 bg-yellow-300 rounded transform rotate-45"></div>
                    
                    {/* Cara sonriente */}
                    <div className="absolute top-3 left-3 w-2 h-2 bg-red-600 rounded-full"></div>
                    <div className="absolute top-3 right-3 w-2 h-2 bg-red-600 rounded-full"></div>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-6 h-3 border-b-2 border-red-600 rounded-full"></div>
                  </div>
                  
                  {/* Lentes de sol */}
                  <div className="absolute top-2 left-1 right-1">
                    <div className="flex justify-center items-center">
                      <div className="w-12 h-6 relative">
                        <div className="absolute left-0 w-5 h-5 bg-gray-800 rounded-full border-2 border-gray-600"></div>
                        <div className="absolute right-0 w-5 h-5 bg-gray-800 rounded-full border-2 border-gray-600"></div>
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-gray-600 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <h1 className="text-5xl font-bold text-yellow-300 mb-2 drop-shadow-lg">Happy Work</h1>
              <p className="text-2xl text-yellow-200 font-medium">Evaluación de Clima Laboral</p>
            </div>

            {/* Main Content */}
            <div className="p-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Bienvenido al Sistema de Evaluación
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Tu opinión es muy importante para nosotros. Ayúdanos a mejorar nuestro ambiente laboral
                  compartiendo tu experiencia de manera completamente anónima y confidencial.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="text-white mb-6">
                      <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="text-2xl font-bold mb-2">Contestar Encuesta</h3>
                      <p className="text-green-100">Comparte tu experiencia laboral</p>
                    </div>
                    <button
                      onClick={() => setCurrentView('form')}
                      className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                    >
                      Iniciar Evaluación
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="text-white mb-6">
                      <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <h3 className="text-2xl font-bold mb-2">Panel Administrativo</h3>
                      <p className="text-blue-100">Acceso para administradores</p>
                    </div>
                    <button
                      onClick={() => setCurrentView('admin')}
                      className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                    >
                      Acceder como Admin
                    </button>
                  </div>
                </div>
              </div>

              {/* ¿Por qué es importante? */}
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">¿Por qué es importante?</h3>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6 text-center border border-blue-200">
                    <div className="text-blue-600 mb-4">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">🔒 Anonimato garantizado</h4>
                    <p className="text-gray-600 text-sm">Tus respuestas son completamente confidenciales</p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6 text-center border border-green-200">
                    <div className="text-green-600 mb-4">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">📈 Mejora continua</h4>
                    <p className="text-gray-600 text-sm">Usamos tus comentarios para implementar cambios positivos</p>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-6 text-center border border-yellow-200">
                    <div className="text-yellow-600 mb-4">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">⭐ Ambiente mejor</h4>
                    <p className="text-gray-600 text-sm">Juntos creamos un lugar de trabajo más satisfactorio</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-100 text-center py-4">
              <p className="text-sm text-gray-500">By Ramón Villanueva 2025</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form View
  if (currentView === 'form') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-red-700 to-red-800 rounded-lg p-4 mb-6">
                <h1 className="text-4xl font-bold text-yellow-300 mb-2">Happy Work</h1>
                <p className="text-yellow-200">Evaluación de Clima Laboral</p>
              </div>
            </div>

            <div className="flex justify-between mb-6">
              <button
                onClick={() => setCurrentView('home')}
                className="text-sm text-gray-600 hover:text-gray-800 underline flex items-center"
              >
                ← Volver al inicio
              </button>
            </div>

            {loading && <LoadingSpinner />}

            <div className="space-y-6">
              {/* Plaza Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecciona tu plaza *
                </label>
                <select
                  value={formData.plaza}
                  onChange={(e) => handleInputChange('plaza', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Selecciona una plaza</option>
                  {plazas.map(plaza => (
                    <option key={plaza} value={plaza}>{plaza}</option>
                  ))}
                </select>
              </div>

              {/* Questions with Star Ratings */}
              {preguntas.map(pregunta => (
                <div key={pregunta.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {pregunta.label} *
                  </label>
                  <div className="flex items-center space-x-4">
                    <StarRating
                      rating={formData[pregunta.key]}
                      onRatingChange={handleInputChange}
                      questionKey={pregunta.key}
                    />
                    <span className="text-sm text-gray-500">
                      {formData[pregunta.key] > 0 ? `${formData[pregunta.key]} de 5 estrellas` : 'Sin calificación'}
                    </span>
                  </div>
                </div>
              ))}

              {/* Inquietudes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comparte tus inquietudes o sugerencias (opcional)
                </label>
                <textarea
                  value={formData.inquietudes}
                  onChange={(e) => handleInputChange('inquietudes', e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Escribe aquí tus comentarios..."
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition duration-200 font-medium disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar Evaluación'}
              </button>
            </div>

            {/* Confidentiality Notice */}
            <div className="mt-8 bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-700 text-center">
                <strong>Recordatorio:</strong> Tu identidad es completamente anónima. 
                Solo se registra la plaza y tus respuestas.
              </p>
            </div>

            <div className="text-center mt-8 text-xs text-gray-500">
              By Ramón Villanueva 2025
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin Login View
  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-red-700 to-red-800 rounded-lg p-4 mb-6">
              <h1 className="text-3xl font-bold text-yellow-300 mb-2">Happy Work</h1>
              <p className="text-yellow-200">Panel Administrativo</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña de Administrador
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ingresa tu contraseña"
              />
            </div>

            <button
              onClick={handleAdminLogin}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition duration-200 font-medium"
            >
              Ingresar al Dashboard
            </button>

            <button
              onClick={() => setCurrentView('home')}
              className="w-full text-indigo-600 hover:text-indigo-800 underline"
            >
              Volver al inicio
            </button>
          </div>

          <div className="text-center mt-8 text-xs text-gray-500">
            By Ramón Villanueva 2025
          </div>
        </div>
      </div>
    );
  }

  // Thanks View
  if (currentView === 'thanks') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-green-800 mb-2">¡Gracias!</h1>
            <p className="text-gray-600">Tu evaluación ha sido enviada exitosamente.</p>
            <p className="text-sm text-gray-500 mt-2">Esta ventana se cerrará automáticamente...</p>
          </div>

          <div className="text-center text-xs text-gray-500">
            By Ramón Villanueva 2025
          </div>
        </div>
      </div>
    );
  }

  // Settings View
  if (currentView === 'settings' && isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <div className="bg-gradient-to-r from-red-700 to-red-800 rounded-lg p-4 mb-4">
                  <h1 className="text-3xl font-bold text-yellow-300 mb-1">Happy Work</h1>
                  <p className="text-yellow-200 text-sm">Configuración de Administrador</p>
                </div>
              </div>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200"
              >
                Volver al Dashboard
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Cambiar Contraseña de Administrador</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Repite la nueva contraseña"
                    />
                  </div>

                  <button
                    onClick={handlePasswordChange}
                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition duration-200 font-medium"
                  >
                    Actualizar Contraseña
                  </button>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Información del Sistema</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Total de respuestas:</strong> {responses.length}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Contraseña actual:</strong> {adminPassword}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Última actualización:</strong> {
                      responses.length > 0 
                        ? new Date(responses[responses.length - 1].timestamp).toLocaleString()
                        : 'Sin datos'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-8 text-xs text-gray-500">
              By Ramón Villanueva 2025
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View
  if (currentView === 'dashboard' && isAdmin) {
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <div className="bg-gradient-to-r from-red-700 to-red-800 rounded-lg p-4 mb-4">
                  <h1 className="text-4xl font-bold text-yellow-300 mb-1">Happy Work</h1>
                  <p className="text-yellow-200">Dashboard de Administrador</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentView('settings')}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200"
                >
                  Configuración
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>

            {loading && <LoadingSpinner />}

            {analytics ? (
              <div className="space-y-8">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-indigo-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-indigo-800 mb-2">Total Respuestas</h3>
                    <p className="text-3xl font-bold text-indigo-600">{analytics.totalResponses}</p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Plazas Participantes</h3>
                    <p className="text-3xl font-bold text-green-600">{analytics.byPlaza.length}</p>
                  </div>
                  <div className="bg-yellow-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">Promedio General</h3>
                    <p className="text-3xl font-bold text-yellow-600">
                      {analytics.avgScores.length > 0 
                        ? (analytics.avgScores.reduce((sum, item) => sum + parseFloat(item.promedio), 0) / analytics.avgScores.length).toFixed(1)
                        : '0'} ⭐
                    </p>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Responses by Plaza */}
                  <div className="bg-white p-6 border rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">Respuestas por Plaza</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.byPlaza}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="plaza" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Satisfaction Distribution */}
                  <div className="bg-white p-6 border rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">Distribución Satisfacción General</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analytics.satisfactionDist}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analytics.satisfactionDist.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Average Scores */}
                <div className="bg-white p-6 border rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">Promedio por Pregunta (Escala 1-5 estrellas)</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={analytics.avgScores} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 5]} />
                      <YAxis dataKey="pregunta" type="category" width={200} />
                      <Tooltip />
                      <Bar dataKey="promedio" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Inquietudes */}
                {responses.filter(r => r.inquietudes).length > 0 && (
                  <div className="bg-white p-6 border rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">Inquietudes y Sugerencias</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {responses
                        .filter(r => r.inquietudes)
                        .map((response, index) => (
                          <div key={index} className="border-l-4 border-indigo-500 pl-4 py-2">
                            <p className="text-gray-700">{response.inquietudes}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {response.plaza} - {new Date(response.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No hay datos disponibles aún.</p>
                <p className="text-gray-400">Las respuestas aparecerán aquí cuando los empleados completen la evaluación.</p>
              </div>
            )}

            <div className="text-center mt-8 text-xs text-gray-500">
              By Ramón Villanueva 2025
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default App;
