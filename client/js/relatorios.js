// EM: client/js/relatorios.js

import * as api from './modules/api.js';
import { renderHeader } from './modules/header.js';

document.addEventListener('DOMContentLoaded', () => {
    // Renderiza o cabeçalho centralizado
    renderHeader();

    // Lógica de autenticação para proteger a página
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role.toLowerCase() !== 'admin') {
        alert('Acesso negado. Apenas administradores podem ver esta página.');
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Variável global para guardar a instância do gráfico de barras para atualizações
    let barChartInstance = null;
    
    // --- CONFIGURAÇÕES GLOBAIS DE ESTILO PARA TODOS OS GRÁFICOS ---
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = '#aaa';
    Chart.defaults.plugins.legend.labels.boxWidth = 12;
    
    // --- FUNÇÕES DE RENDERIZAÇÃO DOS GRÁFICOS ---

    function renderizarChartCanal(data) {
        const ctx = document.getElementById('chartCanalAquisicao').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.map(d => d.canal_aquisicao),
                datasets: [{
                    label: 'Matriculados',
                    data: data.map(d => d.total),
                    backgroundColor: ['#2996f1', '#45a560', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Matriculados por Canal de Aquisição', font: { size: 18 }, color: '#e0e0e0', padding: { bottom: 20 } },
                    legend: { position: 'top', align: 'end' }
                }
            }
        });
    }

    function renderizarChartPolo(data) {
        const ctx = document.getElementById('chartPolo').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(d => d.nome_polo),
                datasets: [{
                    label: 'Matriculados',
                    data: data.map(d => d.total),
                    backgroundColor: ['#6f42c1', '#17a2b8', '#ffc107', '#2996f1', '#45a560', '#dc3545'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Matriculados por Polo', font: { size: 18 }, color: '#e0e0e0', padding: { bottom: 20 } },
                    legend: { position: 'top', align: 'end' }
                }
            }
        });
    }

    function renderizarChartNovosContatos(data, mes, ano) {
        const ctx = document.getElementById('chartNovosContatos').getContext('2d');
        const diasNoMes = new Date(ano, mes, 0).getDate();
        const labels = Array.from({ length: diasNoMes }, (_, i) => String(i + 1).padStart(2, '0'));
        const chartData = Array(diasNoMes).fill(0);
        data.forEach(item => {
            const diaIndex = parseInt(item.dia, 10) - 1;
            if (diaIndex >= 0 && diaIndex < diasNoMes) {
                chartData[diaIndex] = item.total;
            }
        });

        // Se o gráfico já existe, apenas atualiza seus dados. Se não, cria um novo.
        if (barChartInstance) {
            barChartInstance.data.labels = labels;
            barChartInstance.data.datasets[0].data = chartData;
            barChartInstance.options.plugins.title.text = `Novos Contatos em ${String(mes).padStart(2, '0')}/${ano}`;
            barChartInstance.update();
        } else {
            barChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Novos Contatos por Dia',
                        data: chartData,
                        backgroundColor: '#2996f1',
                        borderColor: '#2b6cb0',
                        borderWidth: 1,
                        maxBarThickness: 40
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } }, x: { grid: { display: false } } },
                    plugins: {
                        title: { display: true, text: `Novos Contatos em ${String(mes).padStart(2, '0')}/${ano}`, font: { size: 18 }, color: '#e0e0e0', padding: { bottom: 20 } },
                        legend: { align: 'end' }
                    }
                }
            });
        }
    }

    // --- FUNÇÕES PARA OS FILTROS DE DATA ---
    function popularFiltrosDeData() {
        const mesSelect = document.getElementById('filter-month');
        const anoSelect = document.getElementById('filter-year');
        if (!mesSelect || !anoSelect) return;

        const hoje = new Date();
        const anoAtual = hoje.getFullYear();
        const mesAtual = hoje.getMonth(); // 0-11

        const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        meses.forEach((nomeMes, index) => {
            const option = document.createElement('option');
            option.value = index + 1; // 1-12
            option.textContent = nomeMes;
            if (index === mesAtual) option.selected = true;
            mesSelect.appendChild(option);
        });

        for (let ano = anoAtual; ano >= anoAtual - 5; ano--) {
            const option = document.createElement('option');
            option.value = ano;
            option.textContent = ano;
            anoSelect.appendChild(option);
        }
    }

    async function atualizarGraficoDeBarras() {
        const mes = document.getElementById('filter-month').value;
        const ano = document.getElementById('filter-year').value;
        try {
            const novosContatosData = await api.getNovosContatosMes(ano, mes);
            renderizarChartNovosContatos(novosContatosData, mes, ano);
        } catch (error) {
            console.error("Erro ao atualizar gráfico de novos contatos:", error);
        }
    }
    
    // --- FUNÇÃO DE INICIALIZAÇÃO PRINCIPAL DA PÁGINA ---
    async function inicializarPagina() {
        try {
            // Carrega os gráficos que não dependem de filtro
            const [canalData, poloData] = await Promise.all([
                api.getMatriculasPorCanal(),
                api.getMatriculasPorPolo(),
            ]);
            renderizarChartCanal(canalData);
            renderizarChartPolo(poloData);
            
            // Popula os filtros de data e carrega o gráfico de barras com o mês atual
            popularFiltrosDeData();
            await atualizarGraficoDeBarras();

            // Adiciona os listeners para os filtros de data, para que eles atualizem o gráfico
            document.getElementById('filter-month').addEventListener('change', atualizarGraficoDeBarras);
            document.getElementById('filter-year').addEventListener('change', atualizarGraficoDeBarras);

        } catch (error) {
            console.error("Erro ao carregar dados dos relatórios:", error);
            alert("Não foi possível carregar os dados para os relatórios.");
        }
    }
    
    // Inicia tudo
    inicializarPagina();
});