// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { database } from './firebase'; // Impor database dari firebase.js
import { ref, onValue } from "firebase/database";
import Chart from 'chart.js/auto';
import './style.css'; // Impor CSS Anda

const MAX_DATA_POINTS_LINE_CHART = 20;

function App() {
  const [fireData, setFireData] = useState(null);
  const [error, setError] = useState(null);

  // Refs untuk canvas dan instance chart
  const lineChartCanvasRef = useRef(null);
  const pieChartCanvasRef = useRef(null);
  const barChartCanvasRef = useRef(null);

  const lineChartInstanceRef = useRef(null);
  const pieChartInstanceRef = useRef(null);
  const barChartInstanceRef = useRef(null);

  // Efek untuk mengambil data dari Firebase
  useEffect(() => {
    const fireDetectionRef = ref(database, 'fire_detection'); // Sesuaikan path jika perlu
    const unsubscribe = onValue(fireDetectionRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setFireData(data);
        setError(null);
      } else {
        setError("Data tidak ditemukan di Firebase path tersebut.");
        setFireData(null);
      }
    }, (firebaseError) => {
      console.error("Error membaca data dari Firebase:", firebaseError);
      setError(`Gagal mengambil data dari Firebase: ${firebaseError.message}`);
      setFireData(null);
    });

    // Cleanup listener saat komponen unmount
    return () => unsubscribe();
  }, []);

  // Efek untuk inisialisasi dan update Line Chart
  useEffect(() => {
    if (lineChartCanvasRef.current && fireData) {
      const ctx = lineChartCanvasRef.current.getContext('2d');
      const currentTimestamp = new Date(fireData.timestamp).toLocaleTimeString('id-ID') || new Date().toLocaleTimeString('id-ID');
      const temperatureValue = parseFloat(fireData.temperature) || 0;
      const humidityValue = parseFloat(fireData.humidity) || 0;
      const gasValue = parseInt(fireData.gas) || 0;

      if (!lineChartInstanceRef.current) {
        lineChartInstanceRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: [currentTimestamp],
            datasets: [
              {
                label: 'Suhu (°C)', data: [temperatureValue],
                borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.1, yAxisID: 'yTemperature',
              },
              {
                label: 'Kelembaban (%)', data: [humidityValue],
                borderColor: 'rgb(54, 162, 235)', backgroundColor: 'rgba(54, 162, 235, 0.5)',
                tension: 0.1, yAxisID: 'yHumidity',
              },
              {
                label: 'Gas (ppm)', data: [gasValue],
                borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.1, yAxisID: 'yGas',
              }
            ]
          },
          options: { /* ... Opsi line chart dari jawaban sebelumnya ... */
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'Waktu' } },
                yTemperature: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Suhu (°C)' }},
                yHumidity: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Kelembaban (%)' }, grid: { drawOnChartArea: false }},
                yGas: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Gas (ppm)' }, grid: { drawOnChartArea: false }}
            },
            plugins: { legend: { position: 'top' }, tooltip: { mode: 'index', intersect: false }}
          }
        });
      } else {
        const chart = lineChartInstanceRef.current;
        chart.data.labels.push(currentTimestamp);
        chart.data.datasets[0].data.push(temperatureValue);
        chart.data.datasets[1].data.push(humidityValue);
        chart.data.datasets[2].data.push(gasValue);

        if (chart.data.labels.length > MAX_DATA_POINTS_LINE_CHART) {
          chart.data.labels.shift();
          chart.data.datasets.forEach(dataset => dataset.data.shift());
        }
        chart.update();
      }
    }
  }, [fireData]);

  // Efek untuk inisialisasi dan update Pie Chart
  useEffect(() => {
    if (pieChartCanvasRef.current && fireData) {
      const ctx = pieChartCanvasRef.current.getContext('2d');
      const fuzzyDanger = parseFloat(fireData.fuzzy_danger_level) || 0;
      const safePercentage = Math.max(0, 100 - fuzzyDanger);

      if (!pieChartInstanceRef.current) {
        pieChartInstanceRef.current = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ['Level Bahaya (%)', 'Sisa Aman (%)'],
            datasets: [{
              data: [fuzzyDanger, safePercentage],
              backgroundColor: ['rgb(217, 83, 79)', 'rgb(92, 184, 92)'],
              hoverOffset: 4
            }]
          },
          options: { /* ... Opsi pie chart dari jawaban sebelumnya ... */
             responsive: true, maintainAspectRatio: false,
             plugins: { legend: { position: 'top' }, title: { display: true, text: 'Komposisi Level Bahaya Fuzzy' }}
          }
        });
      } else {
        pieChartInstanceRef.current.data.datasets[0].data = [fuzzyDanger, safePercentage];
        pieChartInstanceRef.current.update();
      }
    }
  }, [fireData]);

  // Efek untuk inisialisasi dan update Bar Chart
  useEffect(() => {
    if (barChartCanvasRef.current && fireData) {
      const ctx = barChartCanvasRef.current.getContext('2d');
      const temperatureValue = parseFloat(fireData.temperature) || 0;
      const humidityValue = parseFloat(fireData.humidity) || 0;
      const gasValue = parseInt(fireData.gas) || 0;

      if (!barChartInstanceRef.current) {
        barChartInstanceRef.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Suhu (°C)', 'Kelembaban (%)', 'Gas (ppm)'],
            datasets: [{
              label: 'Nilai Sensor',
              data: [temperatureValue, humidityValue, gasValue],
              backgroundColor: ['rgba(255, 159, 64, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)'],
              borderColor: ['rgb(255, 159, 64)', 'rgb(75, 192, 192)', 'rgb(153, 102, 255)'],
              borderWidth: 1
            }]
          },
          options: { /* ... Opsi bar chart dari jawaban sebelumnya ... */
            responsive: true, maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, title: {display: true, text: 'Nilai'} } },
            plugins: { legend: { display: false }, title: { display: true, text: 'Visualisasi Nilai Sensor Terkini' }}
          }
        });
      } else {
        barChartInstanceRef.current.data.datasets[0].data = [temperatureValue, humidityValue, gasValue];
        barChartInstanceRef.current.update();
      }
    }
  }, [fireData]);

  // Helper untuk kelas status
  const getStatusClass = (status) => {
    if (!status) return '';
    const s = status.toUpperCase();
    if (s === 'AMAN') return 'status-aman';
    if (s === 'WASPADA') return 'status-waspada';
    if (s === 'BAHAYA') return 'status-bahaya';
    return '';
  };

  const getAlarmClass = (isActive) => isActive ? 'status-bahaya' : 'status-aman';

  if (error) {
    return <div className="app-container error-message">Error: {error}</div>;
  }

  if (!fireData) {
    return <div className="app-container loading-message">Memuat data sensor...</div>;
  }

  const fuzzyDangerNum = parseFloat(fireData.fuzzy_danger_level) || 0;

  return (
    <div id="app">
      <header>
        <h1>🔥 Dashboard Monitoring Deteksi Kebakaran</h1>
      </header>

      <main>
        <section className="data-overview">
          <h2>Data Real-time</h2>
          <div className="data-grid">
            <div className="data-item">
              <span className="label">Status Alarm:</span>
              <span className={`value ${getAlarmClass(fireData.alarm_active)}`}>
                {fireData.alarm_active ? 'AKTIF' : 'TIDAK AKTIF'}
              </span>
            </div>
            <div className="data-item">
              <span className="label">Status Fuzzy:</span>
              <span className={`value ${getStatusClass(fireData.fuzzy_status)}`}>
                {fireData.fuzzy_status || '-'}
              </span>
            </div>
            <div className="data-item">
              <span className="label">Level Bahaya Fuzzy:</span>
              <span className="value">{fuzzyDangerNum.toFixed(2)} %</span>
            </div>
            <div className="data-item">
              <span className="label">Sensor Gas (ppm):</span>
              <span className="value">{parseInt(fireData.gas) || 0}</span>
            </div>
            <div className="data-item">
              <span className="label">Kelembaban (%):</span>
              <span className="value">{(parseFloat(fireData.humidity) || 0).toFixed(1)}</span>
            </div>
            <div className="data-item">
              <span className="label">Suhu (°C):</span>
              <span className="value">{(parseFloat(fireData.temperature) || 0).toFixed(1)}</span>
            </div>
            <div className="data-item">
              <span className="label">Deteksi Api IR:</span>
              <span className={`value ${getAlarmClass(fireData.ir_detected_fire)}`}>
                {fireData.ir_detected_fire ? 'TERDETEKSI' : 'TIDAK TERDETEKSI'}
              </span>
            </div>
            <div className="data-item">
              <span className="label">Timestamp:</span>
              <span className="value">{fireData.timestamp || '-'}</span>
            </div>
          </div>
        </section>

        <section className="charts-section">
          <div className="chart-container">
            <h2>Grafik Sensor (Line Chart)</h2>
            <canvas ref={lineChartCanvasRef} id="lineChart"></canvas>
          </div>
          <div className="chart-container-small">
            <h2>Level Bahaya (Pie Chart)</h2>
            <canvas ref={pieChartCanvasRef} id="pieChart"></canvas>
          </div>
          <div className="chart-container-small">
            <h2>Nilai Sensor Saat Ini (Bar Chart)</h2>
            <canvas ref={barChartCanvasRef} id="barChart"></canvas>
          </div>
        </section>

        <section className="risk-table-section">
          <h2>Tabel Risiko</h2>
          <table id="tableRisk">
            <thead>
              <tr>
                <th>Indikator</th>
                <th>Nilai</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Status Fuzzy</td>
                <td className={getStatusClass(fireData.fuzzy_status)}>{fireData.fuzzy_status || '-'}</td>
                <td>
                  {fireData.fuzzy_status?.toUpperCase() === 'AMAN' && "Kondisi terkendali."}
                  {fireData.fuzzy_status?.toUpperCase() === 'WASPADA' && "Perlu perhatian, ada potensi risiko."}
                  {fireData.fuzzy_status?.toUpperCase() === 'BAHAYA' && "Risiko tinggi, tindakan segera diperlukan!"}
                  {!fireData.fuzzy_status && "-"}
                </td>
              </tr>
              <tr>
                <td>Level Bahaya Fuzzy (%)</td>
                <td className={fuzzyDangerNum > 75 ? 'status-bahaya' : (fuzzyDangerNum > 40 ? 'status-waspada' : 'status-aman')}>
                  {fuzzyDangerNum.toFixed(2)}
                </td>
                <td>{fuzzyDangerNum > 50 ? "Level bahaya signifikan." : "Level bahaya terkendali."}</td>
              </tr>
              <tr>
                <td>Alarm Aktif</td>
                <td className={getAlarmClass(fireData.alarm_active)}>
                  {fireData.alarm_active ? 'AKTIF' : 'TIDAK AKTIF'}
                </td>
                <td>{fireData.alarm_active ? "Alarm berbunyi, evakuasi jika perlu!" : "Alarm tidak aktif."}</td>
              </tr>
              <tr>
                <td>Deteksi Api IR</td>
                <td className={getAlarmClass(fireData.ir_detected_fire)}>
                  {fireData.ir_detected_fire ? 'TERDETEKSI' : 'TIDAK ADA'}
                </td>
                <td>{fireData.ir_detected_fire ? "Sensor IR mendeteksi api!" : "Tidak ada api terdeteksi oleh IR."}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>

      <footer>
        <p>Monitoring Deteksi Kebakaran - &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;