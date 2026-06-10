
        const SUPABASE_URL = 'https://qxhhkezxgmdsdfmwbyyg.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4aGhrZXp4Z21kc2RmbXdieXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNTM2ODIsImV4cCI6MjA5NjYyOTY4Mn0.KufYFMSOCUTsdoqAdb1zToEKCebOSdVQYUC09Lk4T04';
        const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        const TABLE_NAME = 'NISS MANAGMENT';

        let currentPage = 1;
        const pageSize = 15;
        let totalRecords = 0;

        document.addEventListener('DOMContentLoaded', () => {
            setupUIInteractions();
            fetchData();

            document.getElementById('btn-filter').addEventListener('click', () => {
                currentPage = 1;
                fetchData();
            });

            // Permite filtrar al presionar "Enter" en los inputs
            const inputs = document.querySelectorAll('input[type="text"]');
            inputs.forEach(input => {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        currentPage = 1;
                        fetchData();
                    }
                });
            });

            document.getElementById('btn-prev').addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    fetchData();
                }
            });

            document.getElementById('btn-next').addEventListener('click', () => {
                if (currentPage * pageSize < totalRecords) {
                    currentPage++;
                    fetchData();
                }
            });
        });

        async function fetchData() {
            const tbody = document.getElementById('niss-table-body');
            tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-5 text-center text-on-surface-variant font-body-md">Loading records...</td></tr>';
            
            const dept = document.getElementById('filter-department').value.trim();
            const muni = document.getElementById('filter-municipality').value.trim();
            const loc = document.getElementById('filter-locality').value.trim();

            let query = supabase.from(TABLE_NAME).select('*', { count: 'exact' });

            if (dept) query = query.ilike('Departamento', `%${dept}%`);
            if (muni) query = query.ilike('Municipio', `%${muni}%`);
            if (loc) query = query.ilike('Localidad', `%${loc}%`);

            const from = (currentPage - 1) * pageSize;
            const to = from + pageSize - 1;

            query = query.range(from, to).order('NIS', { ascending: true });

            const { data, error, count } = await query;

            if (error) {
                console.error('Error fetching data:', error);
                tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-5 text-center text-error font-bold">Error loading records: ' + error.message + '</td></tr>';
                return;
            }

            totalRecords = count || 0;
            document.getElementById('total-count').innerText = `${totalRecords.toLocaleString()} Total`;
            
            const startRecord = totalRecords === 0 ? 0 : from + 1;
            const endRecord = Math.min(to + 1, totalRecords);
            document.getElementById('pagination-info').innerText = `Showing ${startRecord} to ${endRecord} of ${totalRecords.toLocaleString()} records`;
            document.getElementById('btn-page').innerText = currentPage;
            
            document.getElementById('btn-prev').disabled = currentPage === 1;
            document.getElementById('btn-next').disabled = endRecord >= totalRecords;

            renderTable(data);
        }

        function renderTable(records) {
            const tbody = document.getElementById('niss-table-body');
            tbody.innerHTML = '';

            if (records.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-5 text-center text-on-surface-variant font-body-md">No records found matching filters.</td></tr>';
                return;
            }

            records.forEach(row => {
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-surface-container-low/30 transition-colors group';

                // Usamos un ícono por defecto
                let icon = 'person';
                
                tr.innerHTML = `
<td class="px-6 py-5">
<span class="font-mono-data text-mono-data text-primary font-bold">${row.NIS || '-'}</span>
</td>
<td class="px-6 py-5">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center">
<span class="material-symbols-outlined text-secondary text-sm" data-icon="${icon}">${icon}</span>
</div>
<span class="font-body-lg text-body-lg text-on-surface font-semibold">${row.Cliente || '-'}</span>
</div>
</td>
<td class="px-6 py-5">
<p class="font-body-md text-body-md text-on-surface truncate max-w-xs" title="${row["Dirección"] || row.Direccion || row.direccion || ''}">${row["Dirección"] || row.Direccion || row.direccion || '-'}</p>
<p class="text-[11px] text-on-surface-variant font-medium">${row.Municipio || '-'}, ${row.Departamento || '-'}</p>
</td>
<td class="px-6 py-5">
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>${row["Oficina Comercial"] || 'DISNORTE'}</span>
</td>
<td class="px-6 py-5 text-center">
<button class="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-secondary-container/20 rounded-full text-secondary">
<span class="material-symbols-outlined" data-icon="visibility">visibility</span>
</button>
</td>`;
                tbody.appendChild(tr);
            });
        }

        function setupUIInteractions() {
            // Smooth scale hover for buttons
            const buttons = document.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.addEventListener('mousedown', () => btn.classList.add('scale-95'));
                btn.addEventListener('mouseup', () => btn.classList.remove('scale-95'));
                btn.addEventListener('mouseleave', () => btn.classList.remove('scale-95'));
            });
        }
    