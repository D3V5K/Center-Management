document.addEventListener('DOMContentLoaded', function () {
    // Initialize date
    updateCurrentDate();

    // Initialize navigation
    initializeNavigation();

    // Initialize all data
    initializeData();

    // Setup event listeners
    setupEventListeners();

    // Load Chart.js
    initializeCharts();

    // Initialize agenda
    initializeAgenda();

    // Check for today's absences
    checkTodayAbsences();
});

// Global variables
let studentsData = JSON.parse(localStorage.getItem('studentsData')) || [];
let absencesData = JSON.parse(localStorage.getItem('absencesData')) || [];
let recentActivityData = JSON.parse(localStorage.getItem('recentActivityData')) || [];
let currentWeek = new Date();
let programChart = null;

// Matières par programme
const subjectsByProgram = {
    'web-dev': [
        'HTML/CSS - Développement Web',
        'JavaScript - Programmation',
        'React.js - Framework Frontend',
        'Node.js - Backend Development',
        'PHP - Programmation Serveur',
        'Base de données MySQL',
        'API RESTful'
    ],
    'ui-ux': [
        'Design Thinking - Français',
        'Adobe XD - UI Design',
        'Figma - Prototypage',
        'Recherche Utilisateur - English',
        'Wireframing - Conception',
        'Tests d\'utilisabilité'
    ],
    'data-science': [
        'Python Programming - English',
        'Machine Learning - Français',
        'Data Visualization - English',
        'SQL pour Data Analysis',
        'Statistiques - Français',
        'Deep Learning - English'
    ],
    'cyber-security': [
        'Sécurité Réseau - Français',
        'Ethical Hacking - English',
        'Cryptographie - Mathématiques',
        'Sécurité des Applications',
        'Forensic Analysis - English',
        'Compliance & RGPD'
    ],
    'digital-marketing': [
        'SEO - Marketing Digital',
        'Social Media Management',
        'Google Analytics - English',
        'Content Marketing - Français',
        'Email Marketing',
        'Publicité en ligne - Ads'
    ]
};

// Noms des matières en français/anglais selon le programme
function getSubjectsForProgram(programCode) {
    return subjectsByProgram[programCode] || ['Cours général'];
}

function updateCurrentDate() {
    const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    const currentDate = new Date().toLocaleDateString('en-US', dateOptions);
    const currentDateElement = document.getElementById('current-date');
    if (currentDateElement) {
        currentDateElement.textContent = currentDate;
    }
}

function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.page-section');

    window.switchSection = function (sectionId) {
        sections.forEach(section => {
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            }
        });

        // Update content based on section
        if (sectionId === 'Student') {
            updateProgramChart();
            updateStudentsStats();
        } else if (sectionId === 'Absences') {
            updateAbsenceFilters();
            updateAbsencesTable(absencesData);
        } else if (sectionId === 'Agenda') {
            updateAgenda();
        }
    };

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            let sectionId = this.getAttribute('data-section');
            window.switchSection(sectionId);
        });
    });
}

function initializeData() {
    // Load students
    loadStudents();
    updateStudentCount();
    updateStudentsStats();

    // Load absences
    updateAbsencesTable(absencesData);
    updateStatistics();
    updateTodayAbsences();

    // Load recent activity
    loadRecentActivity();
}

function setupEventListeners() {
    // Student form
    const addStudentBtn = document.getElementById('add-student-btn');
    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', addStudent);
    }

    // Student search and filter
    const searchInput = document.getElementById('search-students');
    const programFilter = document.getElementById('filter-program');

    if (searchInput) {
        searchInput.addEventListener('input', filterStudents);
    }

    if (programFilter) {
        programFilter.addEventListener('change', filterStudents);
    }

    // Absence filters
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyAbsenceFilters);
    }

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAbsenceFilters);
    }

    // Agenda navigation
    const prevWeekBtn = document.getElementById('prev-week');
    const nextWeekBtn = document.getElementById('next-week');

    if (prevWeekBtn) {
        prevWeekBtn.addEventListener('click', () => {
            currentWeek.setDate(currentWeek.getDate() - 7);
            updateAgenda();
        });
    }

    if (nextWeekBtn) {
        nextWeekBtn.addEventListener('click', () => {
            currentWeek.setDate(currentWeek.getDate() + 7);
            updateAgenda();
        });
    }

    // Absence form
    const absenceForm = document.getElementById('absence-form');
    if (absenceForm) {
        absenceForm.addEventListener('submit', handleAbsenceSubmit);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

function handleKeyboardShortcuts(e) {
    // Ctrl+N: New Student
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        window.switchSection('Student');
        document.getElementById('student-name').focus();
    }

    // Ctrl+A: Add Absence
    if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        window.switchSection('Absences');
        openAbsenceModal();
    }

    // Ctrl+G: Agenda
    if (e.ctrlKey && e.key === 'g') {
        e.preventDefault();
        window.switchSection('Agenda');
    }

    // Escape: Close modals
    if (e.key === 'Escape') {
        closeAllModals();
    }
}

function closeAllModals() {
    closeEditModal();
    closeAbsenceModal();
    closeDayDetailsModal();
}

// Student Management
function loadStudents() {
    const tbody = document.getElementById('students-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (studentsData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="no-data">
                    No students found. Add your first student!
                </td>
            </tr>
        `;
        return;
    }

    studentsData.forEach(student => {
        createStudentRow(student);
    });
}

function createStudentRow(student) {
    const tbody = document.getElementById('students-table-body');
    if (!tbody) return;

    const studentAbsences = absencesData.filter(a => a.studentName === student.name);
    const absencesCount = studentAbsences.length;

    let statusClass = 'good';
    if (absencesCount >= 10 && absencesCount < 20) {
        statusClass = 'warning';
    } else if (absencesCount >= 20) {
        statusClass = 'critical';
    }

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <div class="student-user" onclick="openStudentProfile(${student.id})" style="cursor: pointer;">
                <img src="${student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random&color=fff`}" alt="${student.name}">
                <span>${student.name}</span>
            </div>
        </td>
        <td>
            <div class="absence-status ${statusClass}" title="${absencesCount} absences"></div>
            <small>${absencesCount} absences</small>
        </td>
        <td>
            <span class="program-badge program-${student.program}">
                ${getProgramName(student.program)}
            </span>
        </td>
        <td>
            <span class="level-badge level-${student.level}">
                ${getLevelName(student.level)}
            </span>
        </td>

        <td>
            <div class="action-buttons">
                <button class="action-btn edit-btn" onclick="editStudent(${student.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="action-btn delete-btn" onclick="deleteStudent(${student.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
                <button class="action-btn view-btn" onclick="addAbsenceForStudent(${student.id})">
                    <i class="fas fa-calendar-times"></i> Absence
                </button>
            </div>
        </td>
    `;

    tbody.appendChild(row);
}

function addStudent() {
    const name = document.getElementById('student-name').value.trim();
    const program = document.getElementById('student-program').value;
    const level = document.getElementById('student-level').value;
    const phone = document.getElementById('student-phone').value.trim();

    if (!name || !program || !level) {
        showWarning('Please fill in all required fields');
        return;
    }

    const newId = studentsData.length > 0 ? Math.max(...studentsData.map(s => s.id)) + 1 : 1;

    const newStudent = {
        id: newId,
        name,
        program,
        level,
        phone: phone || "Not provided",
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`
    };

    studentsData.push(newStudent);
    localStorage.setItem('studentsData', JSON.stringify(studentsData));

    // Clear form
    document.getElementById('student-name').value = '';
    document.getElementById('student-program').value = '';
    document.getElementById('student-level').value = '';
    document.getElementById('student-phone').value = '';

    // Update UI
    createStudentRow(newStudent);
    updateStudentCount();
    updateStudentsStats();
    updateProgramChart();
    updateAbsenceFilters();

    // Add activity
    addRecentActivity('student-added', `New student "${name}" registered`);

    showSuccess('Student added successfully!');
}

function editStudent(studentId) {
    const student = studentsData.find(s => s.id === studentId);
    if (!student) return;

    document.getElementById('edit-student-id').value = student.id;
    document.getElementById('edit-student-name').value = student.name;
    document.getElementById('edit-student-program').value = student.program;
    document.getElementById('edit-student-level').value = student.level;
    document.getElementById('edit-student-phone').value = student.phone || '';

    openEditModal();
}

function saveStudentChanges() {
    const studentId = parseInt(document.getElementById('edit-student-id').value);
    const name = document.getElementById('edit-student-name').value.trim();
    const program = document.getElementById('edit-student-program').value;
    const level = document.getElementById('edit-student-level').value;
    const phone = document.getElementById('edit-student-phone').value.trim();

    if (!name || !program || !level) {
        showWarning('Please fill in all required fields');
        return;
    }

    const student = studentsData.find(s => s.id === studentId);
    if (!student) return;

    const oldName = student.name;

    student.name = name;
    student.program = program;
    student.level = level;
    student.phone = phone || "Not provided";
    student.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;

    localStorage.setItem('studentsData', JSON.stringify(studentsData));

    loadStudents();
    updateStudentsStats();
    updateProgramChart();
    updateAbsenceFilters();

    closeEditModal();

    addRecentActivity('student-edited', `Student "${oldName}" updated to "${name}"`);
    showSuccess('Student updated successfully!');
}

function deleteStudent(studentId) {
    const student = studentsData.find(s => s.id === studentId);
    if (!student) return;

    showConfirm(`Are you sure you want to delete "${student.name}"?`, 'Yes, delete it!')
        .then(result => {
            if (result.isConfirmed) {
                // Delete all absences for this student first
                absencesData = absencesData.filter(a => a.studentName !== student.name);
                localStorage.setItem('absencesData', JSON.stringify(absencesData));

                // Delete student
                studentsData = studentsData.filter(s => s.id !== studentId);
                localStorage.setItem('studentsData', JSON.stringify(studentsData));

                // Update UI
                loadStudents();
                updateStudentCount();
                updateStudentsStats();
                updateProgramChart();
                updateAbsenceFilters();
                updateAbsencesTable(absencesData);
                updateStatistics();

                addRecentActivity('student-deleted', `Student "${student.name}" deleted`);
                showSuccess('Student deleted successfully!');
            }
        });
}

function filterStudents() {
    const searchValue = document.getElementById('search-students').value.toLowerCase();
    const programValue = document.getElementById('filter-program').value;

    const filteredStudents = studentsData.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchValue);
        const matchesProgram = !programValue || student.program === programValue;
        return matchesSearch && matchesProgram;
    });

    const tbody = document.getElementById('students-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (filteredStudents.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="no-data">
                    No students found matching your criteria
                </td>
            </tr>
        `;
        return;
    }

    filteredStudents.forEach(student => {
        createStudentRow(student);
    });
}

// Absence Management
function updateAbsencesTable(data) {
    const tbody = document.getElementById('absences-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="no-data">
                    No absences found
                </td>
            </tr>
        `;
        return;
    }

    data.forEach(absence => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="student-user">
                    <img src="${absence.studentAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(absence.studentName)}&background=random&color=fff`}" alt="${absence.studentName}">
                    <div>
                        <div class="student-name">${absence.studentName}</div>
                        <div class="student-program">${getProgramName(absence.program)}</div>
                    </div>
                </div>
            </td>
            <td>${formatDate(absence.date)}</td>
            <td>${absence.time}</td>
            <td>${absence.reason}</td>
            <td>
                <span class="program-badge program-${absence.program}">
                    ${getProgramName(absence.program)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn delete-btn" onclick="deleteAbsence(${absence.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;

        tbody.appendChild(row);
    });
}

function updateAbsenceFilters() {
    const studentSelect = document.getElementById('filter-student-absences');
    const programSelect = document.getElementById('filter-program-absences');
    const absenceStudentSelect = document.getElementById('absence-student');
    const absenceSubjectSelect = document.getElementById('absence-subject');

    // Mettre à jour la liste des étudiants pour les filtres
    if (studentSelect) {
        studentSelect.innerHTML = '<option value="">All Students</option>';
        studentsData.forEach(student => {
            const option = document.createElement('option');
            option.value = student.name;
            option.textContent = student.name;
            studentSelect.appendChild(option);
        });
    }

    // Mettre à jour la liste des étudiants pour le modal d'absence
    if (absenceStudentSelect) {
        absenceStudentSelect.innerHTML = '<option value="">Select a student</option>';
        studentsData.forEach(student => {
            const option = document.createElement('option');
            option.value = student.name;
            option.setAttribute('data-program', student.program);
            option.textContent = `${student.name} (${getProgramName(student.program)})`;
            absenceStudentSelect.appendChild(option);
        });

        // Ajouter un event listener pour changer les matières quand l'étudiant change
        absenceStudentSelect.addEventListener('change', function () {
            const selectedOption = this.options[this.selectedIndex];
            if (selectedOption && selectedOption.value) {
                const programCode = selectedOption.getAttribute('data-program');
                updateSubjectOptions(programCode);
            } else {
                // Si aucun étudiant sélectionné, vider les matières
                if (absenceSubjectSelect) {
                    absenceSubjectSelect.innerHTML = '<option value="">Select a student first</option>';
                    absenceSubjectSelect.disabled = true;
                }
            }
        });
    }
}

// Fonction pour mettre à jour les options de matières selon le programme
function updateSubjectOptions(programCode) {
    const subjectSelect = document.getElementById('absence-subject');
    if (!subjectSelect) return;

    subjectSelect.innerHTML = '<option value="">Select subject</option>';
    subjectSelect.disabled = false;

    const subjects = getSubjectsForProgram(programCode);
    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectSelect.appendChild(option);
    });
}
function applyAbsenceFilters() {
    const programValue = document.getElementById('filter-program-absences').value;
    const studentValue = document.getElementById('filter-student-absences').value;
    const dateValue = document.getElementById('filter-date-range').value;

    let filteredAbsences = absencesData.filter(absence => {
        // Filter by program
        if (programValue && absence.program !== programValue) return false;

        // Filter by student
        if (studentValue && absence.studentName !== studentValue) return false;

        // Filter by date range
        if (dateValue !== 'all') {
            const absenceDate = new Date(absence.date);
            const today = new Date();

            switch (dateValue) {
                case 'today':
                    return isSameDay(absenceDate, today);
                case 'yesterday':
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    return isSameDay(absenceDate, yesterday);
                case 'week':
                    const startOfWeek = getStartOfWeek(today);
                    return absenceDate >= startOfWeek;
                case 'month':
                    return absenceDate.getMonth() === today.getMonth() &&
                        absenceDate.getFullYear() === today.getFullYear();
                case 'year':
                    return absenceDate.getFullYear() === today.getFullYear();
            }
        }

        return true;
    });

    updateAbsencesTable(filteredAbsences);
    updateFilteredStatistics(filteredAbsences);
}

function clearAbsenceFilters() {
    document.getElementById('filter-program-absences').value = '';
    document.getElementById('filter-student-absences').value = '';
    document.getElementById('filter-date-range').value = 'all';

    updateAbsencesTable(absencesData);
    updateStatistics();
}

// Function to open absence modal
function openAbsenceModal() {
    updateAbsenceFilters();

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('absence-date').value = today;

    document.getElementById('absence-modal').style.display = 'flex';
}

// Function to handle absence form submission
function handleAbsenceSubmit(e) {
    e.preventDefault();

    const studentName = document.getElementById('absence-student').value;
    const subject = document.getElementById('absence-subject').value; // Nouveau champ
    const date = document.getElementById('absence-date').value;
    const time = document.getElementById('absence-time').value;
    const reason = document.getElementById('absence-reason').value;
    const notes = document.getElementById('absence-notes').value;

    if (!studentName || !subject || !date || !time || !reason) {
        showWarning('Please fill in all required fields');
        return;
    }

    const student = studentsData.find(s => s.name === studentName);
    if (!student) {
        showError('Student not found!');
        return;
    }

    const newId = absencesData.length > 0 ? Math.max(...absencesData.map(a => a.id)) + 1 : 1;

    const newAbsence = {
        id: newId,
        studentName: studentName,
        studentAvatar: student.avatar,
        program: student.program,
        subject: subject, // Nouvelle propriété
        date: date,
        time: time,
        reason: reason,
        notes: notes || ''
    };

    absencesData.push(newAbsence);
    localStorage.setItem('absencesData', JSON.stringify(absencesData));

    // Update UI
    updateAbsencesTable(absencesData);
    updateStatistics();
    updateTodayAbsences();
    loadStudents();
    updateStudentsStats();
    updateProgramChart();

    // Check for today's absences notification
    checkTodayAbsences();

    // Close modal
    closeAbsenceModal();

    // Clear form
    document.getElementById('absence-form').reset();

    addRecentActivity('absence-added', `Absence logged for "${studentName}" - ${subject}`);
    showSuccess('Absence added successfully!');
}

function updateAbsencesTable(data) {
    const tbody = document.getElementById('absences-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="no-data">
                    No absences found
                </td>
            </tr>
        `;
        return;
    }

    data.forEach(absence => {
        // Trouver l'ID de l'étudiant à partir de son nom
        const student = studentsData.find(s => s.name === absence.studentName);
        const studentId = student ? student.id : null;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="student-user clickable-profile" onclick="${studentId ? `openStudentProfile(${studentId})` : ''}" style="cursor: ${studentId ? 'pointer' : 'default'};">
                    <img src="${absence.studentAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(absence.studentName)}&background=random&color=fff`}" alt="${absence.studentName}">
                    <div>
                        <div class="student-name">${absence.studentName}</div>
                        <div class="student-program">${getProgramName(absence.program)}</div>
                    </div>
                    ${studentId ? '<i class="fas fa-external-link-alt" style="margin-left: 8px; font-size: 12px; color: #4f46e5;"></i>' : ''}
                </div>
            </td>
            <td>${absence.subject || 'Not specified'}</td>
            <td>
                <div style="display: flex; flex-direction: column;">
                    <span><i class="far fa-calendar" style="margin-right: 5px; color: #4f46e5;"></i>${formatDate(absence.date)}</span>
                    <span style="font-size: 0.85rem; color: #64748b; margin-top: 4px;">
                        <i class="far fa-clock" style="margin-right: 5px;"></i>${absence.time}
                    </span>
                </div>
            </td>
            <td>${absence.reason}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn delete-btn" onclick="deleteAbsence(${absence.id}); event.stopPropagation();">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;

        tbody.appendChild(row);
    });
}
// Function to add absence for specific student
function addAbsenceForStudent(studentId) {
    const student = studentsData.find(s => s.id === studentId);
    if (!student) return;

    window.switchSection('Absences');

    setTimeout(() => {
        updateAbsenceFilters();

        const today = new Date().toISOString().split('T')[0];
        document.getElementById('absence-student').value = student.name;

        // Déclencher l'événement change pour charger les matières
        const studentSelect = document.getElementById('absence-student');
        const event = new Event('change', { bubbles: true });
        studentSelect.dispatchEvent(event);

        document.getElementById('absence-date').value = today;

        document.getElementById('absence-modal').style.display = 'flex';
    }, 100);
}

// Function to close absence modal
function closeAbsenceModal() {
    document.getElementById('absence-modal').style.display = 'none';
}

// Function to setup event listeners (update this part)
function setupEventListeners() {
    // Student form
    const addStudentBtn = document.getElementById('add-student-btn');
    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', addStudent);
    }

    // Student search and filter
    const searchInput = document.getElementById('search-students');
    const programFilter = document.getElementById('filter-program');

    if (searchInput) {
        searchInput.addEventListener('input', filterStudents);
    }

    if (programFilter) {
        programFilter.addEventListener('change', filterStudents);
    }

    // Absence filters
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyAbsenceFilters);
    }

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAbsenceFilters);
    }

    // Agenda navigation
    const prevWeekBtn = document.getElementById('prev-week');
    const nextWeekBtn = document.getElementById('next-week');

    if (prevWeekBtn) {
        prevWeekBtn.addEventListener('click', () => {
            currentWeek.setDate(currentWeek.getDate() - 7);
            updateAgenda();
        });
    }

    if (nextWeekBtn) {
        nextWeekBtn.addEventListener('click', () => {
            currentWeek.setDate(currentWeek.getDate() + 7);
            updateAgenda();
        });
    }

    // Absence form
    const absenceForm = document.getElementById('absence-form');
    if (absenceForm) {
        absenceForm.addEventListener('submit', handleAbsenceSubmit);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Function to delete absence
function deleteAbsence(absenceId) {
    const absence = absencesData.find(a => a.id === absenceId);
    if (!absence) return;

    showConfirm(`Are you sure you want to delete this absence record?`, 'Yes, delete it!')
        .then(result => {
            if (result.isConfirmed) {
                absencesData = absencesData.filter(a => a.id !== absenceId);
                localStorage.setItem('absencesData', JSON.stringify(absencesData));

                updateAbsencesTable(absencesData);
                updateStatistics();
                updateTodayAbsences();
                loadStudents();
                updateStudentsStats();
                updateProgramChart();

                addRecentActivity('absence-deleted', `Absence record deleted for "${absence.studentName}"`);
                showSuccess('Absence deleted successfully!');
            }
        });
}

// Function to close all modals
function closeAllModals() {
    closeEditModal();
    closeAbsenceModal();
    closeDayDetailsModal();
}

// Function to handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Ctrl+N: New Student
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        window.switchSection('Student');
        document.getElementById('student-name').focus();
    }

    // Ctrl+A: Add Absence
    if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        window.switchSection('Absences');
        openAbsenceModal();
    }

    // Ctrl+G: Agenda
    if (e.ctrlKey && e.key === 'g') {
        e.preventDefault();
        window.switchSection('Agenda');
    }

    // Escape: Close modals
    if (e.key === 'Escape') {
        closeAllModals();
    }
}
function handleAbsenceSubmit(e) {
    e.preventDefault();

    const studentName = document.getElementById('absence-student').value;
    const subject = document.getElementById('absence-subject').value; // Nouveau champ
    const date = document.getElementById('absence-date').value;
    const time = document.getElementById('absence-time').value;
    const reason = document.getElementById('absence-reason').value;
    const notes = document.getElementById('absence-notes').value;

    if (!studentName || !subject || !date || !time || !reason) {
        showWarning('Please fill in all required fields');
        return;
    }

    const student = studentsData.find(s => s.name === studentName);
    if (!student) {
        showError('Student not found!');
        return;
    }

    const newId = absencesData.length > 0 ? Math.max(...absencesData.map(a => a.id)) + 1 : 1;

    const newAbsence = {
        id: newId,
        studentName: studentName,
        studentAvatar: student.avatar,
        program: student.program,
        subject: subject, // Nouvelle propriété - CECI ÉTAIT MANQUANT
        date: date,
        time: time,
        reason: reason,
        notes: notes || ''
    };

    absencesData.push(newAbsence);
    localStorage.setItem('absencesData', JSON.stringify(absencesData));

    // Update UI
    updateAbsencesTable(absencesData);
    updateStatistics();
    updateTodayAbsences();
    loadStudents();
    updateStudentsStats();
    updateProgramChart();

    // Check for today's absences notification
    checkTodayAbsences();

    // Close modal
    closeAbsenceModal();

    // Clear form
    document.getElementById('absence-form').reset();

    addRecentActivity('absence-added', `Absence logged for "${studentName}" - ${subject}`);
    showSuccess('Absence added successfully!');
}
function deleteAbsence(absenceId) {
    const absence = absencesData.find(a => a.id === absenceId);
    if (!absence) return;

    showConfirm(`Are you sure you want to delete this absence record?`, 'Yes, delete it!')
        .then(result => {
            if (result.isConfirmed) {
                absencesData = absencesData.filter(a => a.id !== absenceId);
                localStorage.setItem('absencesData', JSON.stringify(absencesData));

                updateAbsencesTable(absencesData);
                updateStatistics();
                updateTodayAbsences();
                loadStudents();
                updateStudentsStats();
                updateProgramChart();

                addRecentActivity('absence-deleted', `Absence record deleted for "${absence.studentName}"`);
                showSuccess('Absence deleted successfully!');
            }
        });
}

// Agenda Management
function initializeAgenda() {
    updateAgenda();
}

function updateAgenda() {
    const weekRange = getWeekRange(currentWeek);
    document.getElementById('current-week-range').textContent = `Week of ${formatDate(weekRange.start)}`;

    generateAgendaDays(weekRange);
    updateAgendaStats(weekRange);
}

function getWeekRange(date) {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return { start, end };
}

function generateAgendaDays(weekRange) {
    const agendaWeek = document.querySelector('.agenda-week');
    if (!agendaWeek) return;

    agendaWeek.innerHTML = '';

    const currentDate = new Date(weekRange.start);

    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(currentDate);
        const dayAbsences = absencesData.filter(a => {
            const absenceDate = new Date(a.date);
            return isSameDay(absenceDate, dayDate);
        });

        const isToday = isSameDay(dayDate, new Date());

        const dayCard = document.createElement('div');
        dayCard.className = `day-card ${isToday ? 'today' : ''} ${dayAbsences.length > 0 ? 'has-absences' : ''}`;
        dayCard.onclick = () => openDayDetails(dayDate);

        dayCard.innerHTML = `
            <div class="day-header">
                <div>
                    <div class="day-name">${dayDate.toLocaleDateString('en-US', { weekday: 'long' })}</div>
                    <div class="day-date">${formatDate(dayDate)}</div>
                </div>
                ${dayAbsences.length > 0 ? `<span class="absences-count">${dayAbsences.length}</span>` : ''}
            </div>
            <div class="absences-list">
                ${dayAbsences.length > 0 ?
                dayAbsences.slice(0, 3).map(absence => `
                        <div class="absence-item">
                            <div class="student-name">${absence.studentName}</div>
                            <div class="absence-reason">${absence.reason}</div>
                        </div>
                    `).join('') + (dayAbsences.length > 3 ? `<div class="more-absences">+${dayAbsences.length - 3} more</div>` : '')
                : '<div class="no-absences">No absences</div>'
            }
            </div>
        `;

        agendaWeek.appendChild(dayCard);
        currentDate.setDate(currentDate.getDate() + 1);
    }
}

function openDayDetails(date) {
    const dayAbsences = absencesData.filter(a => {
        const absenceDate = new Date(a.date);
        return isSameDay(absenceDate, date);
    });

    document.getElementById('day-details-title').textContent =
        `${date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;

    const absencesList = document.getElementById('day-absences-list');
    absencesList.innerHTML = '';

    if (dayAbsences.length === 0) {
        absencesList.innerHTML = '<div class="no-absences">No absences for this day</div>';
    } else {
        dayAbsences.forEach(absence => {
            const absenceItem = document.createElement('div');
            absenceItem.className = 'absence-item';
            absenceItem.innerHTML = `
                <div class="absence-student-info">
                    <div class="absence-student-name">${absence.studentName}</div>
                    <div class="absence-program">${getProgramName(absence.program)}</div>
                </div>
                <div class="absence-time">${absence.time}</div>
            `;
            absencesList.appendChild(absenceItem);
        });
    }

    // Update statistics
    document.getElementById('day-total-absences').textContent = dayAbsences.length;

    // Calculate program breakdown
    const programBreakdown = {};
    dayAbsences.forEach(absence => {
        programBreakdown[absence.program] = (programBreakdown[absence.program] || 0) + 1;
    });

    const breakdownText = Object.entries(programBreakdown)
        .map(([program, count]) => `${getProgramName(program)}: ${count}`)
        .join(', ');

    document.getElementById('day-program-breakdown').textContent =
        breakdownText || 'No absences';

    // Show modal
    document.getElementById('day-details-modal').style.display = 'flex';
}

function updateAgendaStats(weekRange) {
    const weekAbsences = absencesData.filter(a => {
        const absenceDate = new Date(a.date);
        return absenceDate >= weekRange.start && absenceDate <= weekRange.end;
    });

    const criticalStudents = studentsData.filter(student => {
        const studentAbsences = absencesData.filter(a => a.studentName === student.name);
        return studentAbsences.length >= 20;
    });

    document.getElementById('week-absences-count').textContent = weekAbsences.length;
    document.getElementById('critical-absences-count').textContent = criticalStudents.length;
}

// Chart Management
function initializeCharts() {
    updateProgramChart();
}

function updateProgramChart() {
    const ctx = document.getElementById('programChart');
    if (!ctx) return;

    // Destroy existing chart
    if (programChart) {
        programChart.destroy();
    }

    // Calculate program distribution
    const programCounts = {};
    studentsData.forEach(student => {
        programCounts[student.program] = (programCounts[student.program] || 0) + 1;
    });

    const programs = Object.keys(programCounts).map(p => getProgramName(p));
    const counts = Object.values(programCounts);

    // Colors for programs
    const backgroundColors = [
        'rgba(79, 70, 229, 0.8)',
        'rgba(99, 102, 241, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(217, 70, 239, 0.8)',
        'rgba(236, 72, 153, 0.8)'
    ];

    programChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: programs,
            datasets: [{
                data: counts,
                backgroundColor: backgroundColors.slice(0, programs.length),
                borderColor: backgroundColors.map(c => c.replace('0.8', '1')),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                title: {
                    display: true,
                    text: 'Student Distribution by Program'
                }
            }
        }
    });
}

// Statistics Management
function updateStudentCount() {
    const totalStudentsElement = document.getElementById('total-students-count');
    if (totalStudentsElement) {
        totalStudentsElement.textContent = studentsData.length;
    }
}

function updateStudentsStats() {
    const studentsTotalElement = document.getElementById('students-total-count');
    if (studentsTotalElement) {
        studentsTotalElement.textContent = studentsData.length;
    }
}

function updateTodayAbsences() {
    const today = new Date().toISOString().split('T')[0];
    const todayAbsencesCount = absencesData.filter(absence => absence.date === today).length;

    const todayAbsencesElement = document.getElementById('today-absences-count');
    if (todayAbsencesElement) {
        todayAbsencesElement.textContent = todayAbsencesCount;
    }
}

function updateStatistics() {
    const totalAbsencesElement = document.getElementById('total-abs-count');
    if (totalAbsencesElement) {
        totalAbsencesElement.textContent = absencesData.length;
    }
}

function updateFilteredStatistics(filteredAbsences) {
    const filteredElement = document.getElementById('filtered-abs-count');
    const todayFilteredElement = document.getElementById('today-abs-filtered-count');

    if (filteredElement) {
        filteredElement.textContent = filteredAbsences.length;
    }

    if (todayFilteredElement) {
        const today = new Date().toISOString().split('T')[0];
        const todayCount = filteredAbsences.filter(a => a.date === today).length;
        todayFilteredElement.textContent = todayCount;
    }
}

// Recent Activity
function loadRecentActivity() {
    const activityList = document.querySelector('.activity-list');
    if (!activityList) return;

    activityList.innerHTML = '';

    const sortedActivities = recentActivityData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const latestActivities = sortedActivities.slice(0, 3);

    if (latestActivities.length === 0) {
        activityList.innerHTML = `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="activity-details">
                    <p><strong>No recent activity</strong></p>
                    <p class="activity-time">Start using the system</p>
                </div>
            </div>
        `;
        return;
    }

    latestActivities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';

        let iconClass = 'fas fa-info-circle';
        switch (activity.type) {
            case 'student-added': iconClass = 'fas fa-user-plus'; break;
            case 'student-edited': iconClass = 'fas fa-edit'; break;
            case 'student-deleted': iconClass = 'fas fa-user-minus'; break;
            case 'absence-added': iconClass = 'fas fa-calendar-times'; break;
            case 'absence-deleted': iconClass = 'fas fa-trash'; break;
        }

        const timeAgo = getTimeAgo(activity.timestamp);

        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="activity-details">
                <p><strong>${activity.message}</strong></p>
                <p class="activity-time">${timeAgo}</p>
            </div>
        `;

        activityList.appendChild(activityItem);
    });
}

function addRecentActivity(type, message) {
    const newActivity = {
        id: recentActivityData.length + 1,
        type,
        message,
        timestamp: new Date().toISOString()
    };

    recentActivityData.unshift(newActivity);

    // Keep only last 50 activities
    if (recentActivityData.length > 50) {
        recentActivityData.pop();
    }

    localStorage.setItem('recentActivityData', JSON.stringify(recentActivityData));
    loadRecentActivity();
}

// Today's Absences Notification
function checkTodayAbsences() {
    const today = new Date().toISOString().split('T')[0];
    const todayAbsences = absencesData.filter(a => a.date === today);

    if (todayAbsences.length > 0) {
        const studentsWithAbsences = todayAbsences.map(a => a.studentName);
        const uniqueStudents = [...new Set(studentsWithAbsences)];

        const message = `Today, ${uniqueStudents.length} student(s) are absent: ${uniqueStudents.join(', ')}`;

        // Show notification only once per day
        const lastNotification = localStorage.getItem('lastAbsenceNotification');
        if (lastNotification !== today) {
            setTimeout(() => {
                showInfo(message, "Today's Absences");
                localStorage.setItem('lastAbsenceNotification', today);
            }, 1000);
        }
    }
}

// Helper Functions
function getProgramName(programCode) {
    const programs = {
        'web-dev': 'Web Development',
        'ui-ux': 'UI/UX Design',
        'data-science': 'Data Science',
        'cyber-security': 'Cyber Security',
        'digital-marketing': 'Digital Marketing'
    };
    return programs[programCode] || programCode;
}

function getLevelName(levelCode) {
    const levels = {
        '1ere': '1ère Année',
        '2eme': '2ème Année',
        '3eme': '3ème Année',
    };
    return levels[levelCode] || levelCode;
}

function formatDate(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear();
}

function getStartOfWeek(date) {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return past.toLocaleDateString();
}

// Modal Functions
function openEditModal() {
    document.getElementById('edit-student-modal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('edit-student-modal').style.display = 'none';
}

function closeAbsenceModal() {
    document.getElementById('absence-modal').style.display = 'none';
}

function closeDayDetailsModal() {
    document.getElementById('day-details-modal').style.display = 'none';
}

// Alert Functions
function showConfirm(message, confirmText = 'Yes') {
    return Swal.fire({
        title: 'Are you sure?',
        text: message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#4f46e5',
        cancelButtonColor: '#dc3545',
        confirmButtonText: confirmText,
        cancelButtonText: 'Cancel'
    });
}

function showSuccess(message, title = 'Success!') {
    Swal.fire({
        title: title,
        text: message,
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 2000
    });
}

function showError(message, title = 'Error!') {
    Swal.fire({
        title: title,
        text: message,
        icon: 'error',
        confirmButtonColor: '#dc3545'
    });
}

function showWarning(message, title = 'Warning!') {
    Swal.fire({
        title: title,
        text: message,
        icon: 'warning',
        confirmButtonColor: '#ffc107'
    });
}

function showInfo(message, title = 'Info') {
    Swal.fire({
        title: title,
        text: message,
        icon: 'info',
        confirmButtonColor: '#17a2b8'
    });
}

// Student Profile (placeholder)
// Replace the openStudentProfile function with this enhanced version:
function openStudentProfile(studentId) {
    const student = studentsData.find(s => s.id === studentId);
    if (!student) return;

    const studentAbsences = absencesData.filter(a => a.studentName === student.name);
    const absencesCount = studentAbsences.length;
    const programName = getProgramName(student.program);
    const levelName = getLevelName(student.level);

    // Calculate statistics
    const today = new Date().toISOString().split('T')[0];
    const thisMonthAbsences = studentAbsences.filter(a => {
        const absenceDate = new Date(a.date);
        const now = new Date();
        return absenceDate.getMonth() === now.getMonth() &&
            absenceDate.getFullYear() === now.getFullYear();
    }).length;

    const thisWeekAbsences = studentAbsences.filter(a => {
        const absenceDate = new Date(a.date);
        const startOfWeek = getStartOfWeek(new Date());
        return absenceDate >= startOfWeek;
    }).length;

    // Create professional HTML
    const message = `
        <div class="student-profile-content">
            <div class="student-profile-header">
                <div class="profile-avatar-container">
                    <img src="${student.avatar}" alt="${student.name}" class="profile-avatar">
                    <div class="profile-basic-info">
                        <h2>${student.name}</h2>
                        <p class="profile-tagline">${programName} Student</p>
                        <div class="profile-badges">
                            <span class="profile-badge">
                                <i class="fas fa-graduation-cap"></i> ${levelName}
                            </span>
                            <span class="profile-badge">
                                <i class="fas fa-id-card"></i> ID: STU-${String(student.id).padStart(4, '0')}
                            </span>
                            <span class="profile-badge">
                                <i class="fas fa-calendar-alt"></i> Joined ${formatDate(new Date())}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="student-profile-body">
                <div class="profile-stats-grid">
                    <div class="profile-stat-card">
                        <div class="profile-stat-number">${absencesCount}</div>
                        <div class="profile-stat-label">Total Absences</div>
                    </div>
                    <div class="profile-stat-card">
                        <div class="profile-stat-number">${thisMonthAbsences}</div>
                        <div class="profile-stat-label">This Month</div>
                    </div>
                    <div class="profile-stat-card">
                        <div class="profile-stat-number">${thisWeekAbsences}</div>
                        <div class="profile-stat-label">This Week</div>
                    </div>
                </div>
                
                <div class="profile-section">
                    <h4><i class="fas fa-info-circle"></i> Student Information</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Full Name</span>
                            <div class="detail-value">${student.name}</div>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Program</span>
                            <div class="detail-value">
                                <span class="program-badge program-${student.program}">
                                    ${programName}
                                </span>
                            </div>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Academic Level</span>
                            <div class="detail-value">
                                <span class="level-badge level-${student.level}">
                                    ${levelName}
                                </span>
                            </div>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Contact Number</span>
                            <div class="detail-value">
                                <i class="fas fa-phone" style="margin-right: 8px; color: #4f46e5;"></i>
                                ${student.phone || 'Not provided'}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="profile-section">
                    <h4><i class="fas fa-history"></i> Recent Absence History</h4>
                    <div class="absence-history-section">
                        <div class="absence-history-list">
                            ${studentAbsences.length > 0 ?
            studentAbsences.slice(0, 5).map(a => `
                                    <div class="absence-history-item">
                                        <span class="absence-date">
                                            <i class="far fa-calendar" style="margin-right: 8px;"></i>
                                            ${formatDate(a.date)}
                                        </span>
                                        <span class="absence-reason">${a.reason}</span>
                                    </div>
                                `).join('') +
            (studentAbsences.length > 5 ?
                `<div class="absence-history-item" style="background: #f0f9ff; border-left-color: #0ea5e9;">
                                        <span class="absence-date">
                                            <i class="fas fa-ellipsis-h" style="margin-right: 8px;"></i>
                                            ${studentAbsences.length - 5} more absence(s)
                                        </span>
                                        <span class="absence-reason" style="background: rgba(14, 165, 233, 0.1);">
                                            View All
                                        </span>
                                    </div>`
                : '')
            : '<div class="no-absences-message">Perfect attendance! No absences recorded.</div>'
        }
                        </div>
                    </div>
                </div>
                
                <div class="student-profile-actions">
                    <button class="action-button edit" onclick="editStudent(${studentId}); Swal.close();">
                        <i class="fas fa-edit"></i> Edit Profile
                    </button>
                    <button class="action-button absence" onclick="addAbsenceForStudent(${studentId}); Swal.close();">
                        <i class="fas fa-calendar-times"></i> Log Absence
                    </button>
                    <button class="action-button history" onclick="viewStudentFullHistory(${studentId});">
                        <i class="fas fa-chart-bar"></i> View Analytics
                    </button>
                </div>
            </div>
        </div>
    `;

    Swal.fire({
        title: '',
        html: message,
        width: 750,
        showCloseButton: true,
        showConfirmButton: false,
        customClass: {
            popup: 'student-profile-modal',
            closeButton: 'profile-close-btn'
        },
        didOpen: () => {
            // Add event listeners to action buttons
            const editBtn = document.querySelector('.action-button.edit');
            const absenceBtn = document.querySelector('.action-button.absence');
            const historyBtn = document.querySelector('.action-button.history');

            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    editStudent(studentId);
                    Swal.close();
                });
            }

            if (absenceBtn) {
                absenceBtn.addEventListener('click', () => {
                    addAbsenceForStudent(studentId);
                    Swal.close();
                });
            }

            if (historyBtn) {
                historyBtn.addEventListener('click', () => {
                    viewStudentFullHistory(studentId);
                });
            }
        }
    });
}

// Add this new function for viewing full student history
function viewStudentFullHistory(studentId) {
    const student = studentsData.find(s => s.id === studentId);
    if (!student) return;

    const studentAbsences = absencesData.filter(a => a.studentName === student.name);
    const programName = getProgramName(student.program);

    // Group absences by month for chart
    const absencesByMonth = {};
    const last6Months = [];

    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        last6Months.push(monthKey);
        absencesByMonth[monthKey] = 0;
    }

    studentAbsences.forEach(absence => {
        const date = new Date(absence.date);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (absencesByMonth[monthKey] !== undefined) {
            absencesByMonth[monthKey]++;
        }
    });

    const chartData = last6Months.map(month => absencesByMonth[month]);

    const message = `
        <div class="analytics-modal">
            <h3 style="color: #1e293b; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
                <i class="fas fa-chart-line" style="color: #4f46e5;"></i>
                Analytics for ${student.name}
            </h3>
            
            <div style="background: #f8fafc; padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
                <h4 style="color: #475569; margin-bottom: 1rem;">Absence Trend (Last 6 Months)</h4>
                <canvas id="studentAnalyticsChart" height="150"></canvas>
            </div>
            
            <div style="margin-top: 1.5rem;">
                <h4 style="color: #475569; margin-bottom: 1rem;">Detailed Absence History</h4>
                <div style="max-height: 300px; overflow-y: auto;">
                    ${studentAbsences.length > 0 ?
            studentAbsences.map((a, index) => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: ${index % 2 === 0 ? '#f8fafc' : 'white'}; border-radius: 8px; margin-bottom: 0.5rem;">
                                <div>
                                    <strong>${formatDate(a.date)}</strong>
                                    <div style="font-size: 0.875rem; color: #64748b; margin-top: 0.25rem;">
                                        ${a.time} • ${a.reason}
                                        ${a.notes ? `<br><small>Note: ${a.notes}</small>` : ''}
                                    </div>
                                </div>
                                <button class="action-btn delete-btn" onclick="deleteAbsence(${a.id}); Swal.close();" style="padding: 0.375rem 0.75rem; font-size: 0.75rem;">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        `).join('') :
            '<p style="text-align: center; color: #94a3b8; padding: 2rem;">No absence records found</p>'
        }
                </div>
            </div>
        </div>
    `;

    Swal.fire({
        title: 'Student Analytics',
        html: message,
        width: 800,
        showCloseButton: true,
        showConfirmButton: true,
        confirmButtonText: 'Close',
        confirmButtonClass: 'profile-action-btn',
        didOpen: () => {
            // Create chart
            const ctx = document.getElementById('studentAnalyticsChart');
            if (ctx) {
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: last6Months,
                        datasets: [{
                            label: 'Absences',
                            data: chartData,
                            borderColor: '#4f46e5',
                            backgroundColor: 'rgba(79, 70, 229, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: '#4f46e5',
                            pointBorderColor: '#ffffff',
                            pointBorderWidth: 2,
                            pointRadius: 5
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 1
                                }
                            }
                        }
                    }
                });
            }
        }
    });
}

// Add absence for specific student
function addAbsenceForStudent(studentId) {
    const student = studentsData.find(s => s.id === studentId);
    if (!student) return;

    window.switchSection('Absences');

    setTimeout(() => {
        updateAbsenceFilters();

        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        document.getElementById('absence-student').value = student.name;
        document.getElementById('absence-date').value = today;
        document.getElementById('absence-time').value = time;

        document.getElementById('absence-modal').style.display = 'flex';
    }, 100);
}

// Add these functions to your script.js file:

// Global variable to track current program
let currentProgram = '';

// Function to open program details modal
function openProgramDetails(programCode) {
    currentProgram = programCode;
    const programName = getProgramName(programCode);

    // Set modal title
    document.getElementById('program-details-title').textContent = `${programName} Students`;

    // Get students in this program
    const programStudents = studentsData.filter(student => student.program === programCode);
    const programAbsences = absencesData.filter(absence => absence.program === programCode);

    // Update statistics
    document.getElementById('program-total-students').textContent = programStudents.length;

    // Count unique levels
    const levels = [...new Set(programStudents.map(student => student.level))];
    document.getElementById('program-by-level').textContent = `${levels.length} Levels`;

    document.getElementById('program-total-absences').textContent = programAbsences.length;

    // Generate level distribution
    generateLevelDistribution(programStudents);

    // Load students tableNouveau
    loadProgramStudentsTable(programStudents);

    // Show modal
    document.getElementById('program-details-modal').style.display = 'flex';
}

// Function to generate level distribution bars
function generateLevelDistribution(students) {
    const levelBars = document.getElementById('level-bars');
    levelBars.innerHTML = '';

    // Count students by level
    const levelCounts = {
        '1ere': 0,
        '2eme': 0,
        '3eme': 0,
    };

    students.forEach(student => {
        if (levelCounts[student.level] !== undefined) {
            levelCounts[student.level]++;
        }
    });

    // Calculate percentages and create bars
    const totalStudents = students.length;

    Object.entries(levelCounts).forEach(([level, count]) => {
        if (count > 0) {
            const percentage = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;

            const levelBar = document.createElement('div');
            levelBar.className = 'level-bar-item';
            levelBar.innerHTML = `
                <div class="level-bar-header">
                    <span class="level-name">${getLevelName(level)}</span>
                    <span class="level-count">${count} students (${percentage}%)</span>
                </div>
                <div class="level-bar-container">
                    <div class="level-bar-fill" style="width: ${percentage}%;"></div>
                </div>
            `;

            levelBars.appendChild(levelBar);
        }
    });
}

// Function to load program students table
function loadProgramStudentsTable(students) {
    const tbody = document.getElementById('program-students-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (students.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="no-data">
                    No students found in this program
                </td>
            </tr>
        `;
        return;
    }

    // Sort by level order
    const levelOrder = ['1ere', '2eme', '3eme',];
    students.sort((a, b) => levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level));

    students.forEach(student => {
        const studentAbsences = absencesData.filter(a => a.studentName === student.name);
        const absencesCount = studentAbsences.length;

        let statusClass = 'good';
        if (absencesCount >= 10 && absencesCount < 20) {
            statusClass = 'warning';
        } else if (absencesCount >= 20) {
            statusClass = 'critical';
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="student-user" onclick="openStudentProfile(${student.id})" style="cursor: pointer;">
                    <img src="${student.avatar}" alt="${student.name}">
                    <span>${student.name}</span>
                </div>
            </td>
            <td>
                <span class="level-badge level-${student.level}">
                    ${getLevelName(student.level)}
                </span>
            </td>
            <td>
                <div class="absence-status-container">
                    <div class="absence-status ${statusClass}"></div>
                    <span>${absencesCount} absences</span>
                </div>
            </td>
            <td>${student.phone || 'Not provided'}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="editStudent(${student.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn view-btn" onclick="addAbsenceForStudent(${student.id})">
                        <i class="fas fa-calendar-times"></i>
                    </button>
                </div>
            </td>
        `;

        tbody.appendChild(row);
    });
}

// Function to filter program students by level
function filterProgramStudents() {
    const levelFilter = document.getElementById('filter-program-level').value;
    const programStudents = studentsData.filter(student => student.program === currentProgram);

    let filteredStudents = programStudents;
    if (levelFilter) {
        filteredStudents = programStudents.filter(student => student.level === levelFilter);
    }

    loadProgramStudentsTable(filteredStudents);
}

// Function to close program details modal
function closeProgramDetailsModal() {
    document.getElementById('program-details-modal').style.display = 'none';
    currentProgram = '';
}

// Function to update Chart.js to make it clickable
function updateProgramChart() {
    const ctx = document.getElementById('programChart');
    if (!ctx) return;

    // Destroy existing chart
    if (programChart) {
        programChart.destroy();
    }

    // Calculate program distribution
    const programCounts = {};
    studentsData.forEach(student => {
        programCounts[student.program] = (programCounts[student.program] || 0) + 1;
    });

    const programs = Object.keys(programCounts);
    const programNames = programs.map(p => getProgramName(p));
    const counts = Object.values(programCounts);

    // Colors for programs
    const backgroundColors = [
        'rgba(79, 70, 229, 0.8)',
        'rgba(99, 102, 241, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(217, 70, 239, 0.8)'
    ];

    programChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: programNames,
            datasets: [{
                data: counts,
                backgroundColor: backgroundColors.slice(0, programs.length),
                borderColor: backgroundColors.map(c => c.replace('0.8', '1')),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                title: {
                    display: true,
                    text: 'Student Distribution by Program'
                }
            },
            // Make chart clickable
            onClick: (evt, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const programCode = programs[index];
                    openProgramDetails(programCode);
                }
            }
        }
    });
}

// Also update the closeAllModals function to include program details modal
function closeAllModals() {
    closeEditModal();
    closeAbsenceModal();
    closeDayDetailsModal();
    closeProgramDetailsModal();
}

// Global variable for agenda chart
let agendaTrendChart = null;

// Replace your existing initializeAgenda and updateAgenda functions with these:

function initializeAgenda() {
    updateProfessionalAgenda();

    // Add event listeners for professional navigation
    const prevBtn = document.getElementById('prev-week-professional');
    const nextBtn = document.getElementById('next-week-professional');
    const programFilter = document.getElementById('filter-program-agenda');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentWeek.setDate(currentWeek.getDate() - 7);
            updateProfessionalAgenda();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentWeek.setDate(currentWeek.getDate() + 7);
            updateProfessionalAgenda();
        });
    }

    if (programFilter) {
        programFilter.addEventListener('change', () => {
            updateProfessionalAgenda();
        });
    }
}

function updateProfessionalAgenda() {
    const weekRange = getWeekRange(currentWeek);

    // Update header
    const weekRangeElement = document.getElementById('current-week-range-professional');
    if (weekRangeElement) {
        const startDate = formatDate(weekRange.start);
        const endDate = formatDate(weekRange.end);
        weekRangeElement.textContent = `${startDate} - ${endDate}`;
    }

    // Generate days
    generateProfessionalAgendaDays(weekRange);

    // Update all stats
    updateProfessionalAgendaStats(weekRange);

    // Update trend chart
    updateAgendaTrendChart(weekRange);

    // Update top absent students
    updateTopAbsentStudents(weekRange);
}

function generateProfessionalAgendaDays(weekRange) {
    const agendaGrid = document.getElementById('professional-agenda-days');
    if (!agendaGrid) return;

    agendaGrid.innerHTML = '';

    const currentDate = new Date(weekRange.start);
    const programFilter = document.getElementById('filter-program-agenda')?.value || '';

    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(currentDate);

        // Filter absences for this day
        let dayAbsences = absencesData.filter(a => {
            const absenceDate = new Date(a.date);
            return isSameDay(absenceDate, dayDate);
        });

        // Apply program filter if selected
        if (programFilter) {
            dayAbsences = dayAbsences.filter(a => a.program === programFilter);
        }

        const isToday = isSameDay(dayDate, new Date());

        const dayCard = document.createElement('div');
        dayCard.className = `day-card-professional ${isToday ? 'today' : ''} ${dayAbsences.length > 0 ? 'has-absences' : ''}`;
        dayCard.onclick = () => openDayDetails(dayDate);

        // Build absences HTML
        let absencesHTML = '';
        if (dayAbsences.length > 0) {
            absencesHTML = dayAbsences.slice(0, 2).map(absence => `
                <div class="absence-item-professional">
                    <span class="absence-student">${absence.studentName.split(' ')[0]}</span>
                    <span class="absence-time-small">${absence.time}</span>
                </div>
            `).join('');

            if (dayAbsences.length > 2) {
                absencesHTML += `<span class="more-absences-badge">+${dayAbsences.length - 2} more</span>`;
            }
        } else {
            absencesHTML = '<div style="color: #94a3b8; font-size: 0.75rem; text-align: center; padding: 0.5rem;">No absences</div>';
        }

        dayCard.innerHTML = `
            <div class="day-header-professional">
                <span class="day-name-professional">${dayDate.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                <span class="day-date-professional">${dayDate.getDate()}</span>
            </div>
            ${dayAbsences.length > 0 ? `<div style="margin-bottom: 0.5rem;"><span class="absence-badge"><i class="fas fa-user-clock"></i> ${dayAbsences.length}</span></div>` : ''}
            <div class="absences-list-professional">
                ${absencesHTML}
            </div>
        `;

        agendaGrid.appendChild(dayCard);
        currentDate.setDate(currentDate.getDate() + 1);
    }
}

function updateProfessionalAgendaStats(weekRange) {
    // Filter week absences
    const weekAbsences = absencesData.filter(a => {
        const absenceDate = new Date(a.date);
        return absenceDate >= weekRange.start && absenceDate <= weekRange.end;
    });

    // Critical students (20+ absences)
    const criticalStudents = studentsData.filter(student => {
        const studentAbsences = absencesData.filter(a => a.studentName === student.name);
        return studentAbsences.length >= 20;
    });

    // Today's absences
    const today = new Date().toISOString().split('T')[0];
    const todayAbsences = absencesData.filter(a => a.date === today).length;

    // Attendance rate (example calculation)
    const totalStudents = studentsData.length;
    const attendanceRate = totalStudents > 0
        ? Math.round(((totalStudents - todayAbsences) / totalStudents) * 100)
        : 100;

    // Update DOM
    document.getElementById('week-absences-count-professional').textContent = weekAbsences.length;
    document.getElementById('critical-absences-count-professional').textContent = criticalStudents.length;
    document.getElementById('attendance-rate').textContent = `${attendanceRate}%`;
    document.getElementById('today-absences-agenda').textContent = todayAbsences;
}

function updateAgendaTrendChart(weekRange) {
    const ctx = document.getElementById('agendaTrendChart');
    if (!ctx) return;

    // Destroy existing chart
    if (agendaTrendChart) {
        agendaTrendChart.destroy();
    }

    // Get last 7 days
    const labels = [];
    const data = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));

        const dateString = date.toISOString().split('T')[0];
        const count = absencesData.filter(a => a.date === dateString).length;
        data.push(count);
    }

    agendaTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Absences',
                data: data,
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#4f46e5',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#f1f5f9'
                    },
                    ticks: {
                        stepSize: 1,
                        color: '#64748b'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#64748b'
                    }
                }
            }
        }
    });
}

function updateTopAbsentStudents(weekRange) {
    const container = document.getElementById('top-absent-students');
    if (!container) return;

    // Get week absences
    const weekAbsences = absencesData.filter(a => {
        const absenceDate = new Date(a.date);
        return absenceDate >= weekRange.start && absenceDate <= weekRange.end;
    });

    // Count absences per student
    const absenceCounts = {};
    weekAbsences.forEach(absence => {
        absenceCounts[absence.studentName] = (absenceCounts[absence.studentName] || 0) + 1;
    });

    // Sort and get top 5
    const topStudents = Object.entries(absenceCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (topStudents.length === 0) {
        container.innerHTML = `
            <div class="top-student-item">
                <div class="top-student-info">
                    <img src="https://ui-avatars.com/api/?name=No+Data&background=10b981&color=fff" 
                         alt="No Data" class="top-student-avatar">
                    <div>
                        <div class="top-student-name">No absences this week</div>
                        <div class="top-student-program">Perfect attendance! 🎉</div>
                    </div>
                </div>
                <div class="top-student-count">0</div>
            </div>
        `;
        return;
    }

    container.innerHTML = topStudents.map(([name, count], index) => {
        const student = studentsData.find(s => s.name === name) || {};
        const program = student.program ? getProgramName(student.program) : 'Unknown';
        const avatar = student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff`;

        return `
            <div class="top-student-item">
                <div class="top-student-info">
                    <img src="${avatar}" alt="${name}" class="top-student-avatar">
                    <div>
                        <div class="top-student-name">${name}</div>
                        <div class="top-student-program">${program}</div>
                    </div>
                </div>
                <div class="top-student-count">${count}</div>
            </div>
        `;
    }).join('');
}

// Function to generate weekly report (placeholder)
function generateWeeklyReport() {
    showSuccess('Weekly report generated successfully!', 'Report Ready');
}

function addAbsenceForStudent(studentId) {
    const student = studentsData.find(s => s.id === studentId);
    if (!student) return;

    window.switchSection('Absences');

    setTimeout(() => {
        updateAbsenceFilters();

        const today = new Date().toISOString().split('T')[0];
        document.getElementById('absence-student').value = student.name;

        // Déclencher l'événement change pour charger les matières
        const studentSelect = document.getElementById('absence-student');
        const event = new Event('change', { bubbles: true });
        studentSelect.dispatchEvent(event);

        document.getElementById('absence-date').value = today;

        document.getElementById('absence-modal').style.display = 'flex';
    }, 100);
}

// Global variable for absences program chart
let absencesProgramChart = null;

// Function to update program distribution chart in absences section
function updateAbsencesProgramChart(filteredAbsences = absencesData) {
    const ctx = document.getElementById('absencesProgramChart');
    if (!ctx) return;

    // Destroy existing chart
    if (absencesProgramChart) {
        absencesProgramChart.destroy();
    }

    // Calculate program distribution from filtered absences
    const programCounts = {};
    filteredAbsences.forEach(absence => {
        programCounts[absence.program] = (programCounts[absence.program] || 0) + 1;
    });

    const programs = Object.keys(programCounts);
    const programNames = programs.map(p => getProgramName(p));
    const counts = Object.values(programCounts);

    // If no data, show message
    if (programs.length === 0) {
        ctx.parentElement.innerHTML = `
            <div style="height: 200px; display: flex; align-items: center; justify-content: center; color: #94a3b8;">
                <i class="fas fa-chart-pie" style="margin-right: 10px;"></i>
                No data to display
            </div>
        `;
        return;
    }

    // Colors for programs
    const backgroundColors = [
        'rgba(79, 70, 229, 0.8)',
        'rgba(99, 102, 241, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(217, 70, 239, 0.8)',
        'rgba(236, 72, 153, 0.8)'
    ];

    // Create chart
    absencesProgramChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: programNames,
            datasets: [{
                data: counts,
                backgroundColor: backgroundColors.slice(0, programs.length),
                borderColor: backgroundColors.map(c => c.replace('0.8', '1')),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Hide default legend, we'll create custom one
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} absences (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '65%'
        }
    });

    // Create custom legend
    updateAbsencesProgramLegend(programs, programNames, counts, backgroundColors);
}

// Function to update custom legend
function updateAbsencesProgramLegend(programs, programNames, counts, colors) {
    const legendContainer = document.getElementById('absences-program-legend');
    if (!legendContainer) return;

    legendContainer.innerHTML = '';

    const total = counts.reduce((a, b) => a + b, 0);

    programs.forEach((program, index) => {
        const percentage = total > 0 ? Math.round((counts[index] / total) * 100) : 0;

        const legendItem = document.createElement('div');
        legendItem.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 5px 10px;
            background: #f8fafc;
            border-radius: 20px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid #e2e8f0;
        `;

        legendItem.onmouseover = () => {
            legendItem.style.background = '#f1f5f9';
            legendItem.style.transform = 'translateY(-2px)';
        };

        legendItem.onmouseout = () => {
            legendItem.style.background = '#f8fafc';
            legendItem.style.transform = 'translateY(0)';
        };

        legendItem.onclick = () => {
            // Filter by this program
            const programFilter = document.getElementById('filter-program-absences');
            if (programFilter) {
                programFilter.value = program;
                applyAbsenceFilters();
            }
        };

        legendItem.innerHTML = `
            <span style="width: 12px; height: 12px; background: ${colors[index]}; border-radius: 3px;"></span>
            <span style="font-weight: 500; color: #1e293b;">${programNames[index]}</span>
            <span style="background: ${colors[index].replace('0.8', '0.1')}; color: ${colors[index].replace('0.8', '1')}; padding: 2px 6px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">
                ${counts[index]} (${percentage}%)
            </span>
        `;

        legendContainer.appendChild(legendItem);
    });
}

// Modified applyAbsenceFilters function to update program chart
function applyAbsenceFilters() {
    const programValue = document.getElementById('filter-program-absences').value;
    const studentValue = document.getElementById('filter-student-absences').value;
    const dateValue = document.getElementById('filter-date-range').value;

    let filteredAbsences = absencesData.filter(absence => {
        // Filter by program
        if (programValue && absence.program !== programValue) return false;

        // Filter by student
        if (studentValue && absence.studentName !== studentValue) return false;

        // Filter by date range
        if (dateValue !== 'all') {
            const absenceDate = new Date(absence.date);
            const today = new Date();

            switch (dateValue) {
                case 'today':
                    return isSameDay(absenceDate, today);
                case 'yesterday':
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    return isSameDay(absenceDate, yesterday);
                case 'week':
                    const startOfWeek = getStartOfWeek(today);
                    return absenceDate >= startOfWeek;
                case 'month':
                    return absenceDate.getMonth() === today.getMonth() &&
                        absenceDate.getFullYear() === today.getFullYear();
                case 'year':
                    return absenceDate.getFullYear() === today.getFullYear();
            }
        }

        return true;
    });

    updateAbsencesTable(filteredAbsences);
    updateFilteredStatistics(filteredAbsences);
    updateAbsencesProgramChart(filteredAbsences); // Add this line
}

// Modified clearAbsenceFilters function
function clearAbsenceFilters() {
    document.getElementById('filter-program-absences').value = '';
    document.getElementById('filter-student-absences').value = '';
    document.getElementById('filter-date-range').value = 'all';

    updateAbsencesTable(absencesData);
    updateStatistics();
    updateAbsencesProgramChart(absencesData); // Add this line
}

// Modified initializeData function to include program chart
function initializeData() {
    // Load students
    loadStudents();
    updateStudentCount();
    updateStudentsStats();

    // Load absences
    updateAbsencesTable(absencesData);
    updateStatistics();
    updateTodayAbsences();
    updateAbsencesProgramChart(absencesData); // Add this line

    // Load recent activity
    loadRecentActivity();
}

// Modified handleAbsenceSubmit function
function handleAbsenceSubmit(e) {
    e.preventDefault();

    const studentName = document.getElementById('absence-student').value;
    const subject = document.getElementById('absence-subject').value;
    const date = document.getElementById('absence-date').value;
    const time = document.getElementById('absence-time').value;
    const reason = document.getElementById('absence-reason').value;
    const notes = document.getElementById('absence-notes').value;

    if (!studentName || !subject || !date || !time || !reason) {
        showWarning('Please fill in all required fields');
        return;
    }

    const student = studentsData.find(s => s.name === studentName);
    if (!student) {
        showError('Student not found!');
        return;
    }

    const newId = absencesData.length > 0 ? Math.max(...absencesData.map(a => a.id)) + 1 : 1;

    const newAbsence = {
        id: newId,
        studentName: studentName,
        studentAvatar: student.avatar,
        program: student.program,
        subject: subject,
        date: date,
        time: time,
        reason: reason,
        notes: notes || ''
    };

    absencesData.push(newAbsence);
    localStorage.setItem('absencesData', JSON.stringify(absencesData));

    // Update UI
    updateAbsencesTable(absencesData);
    updateStatistics();
    updateTodayAbsences();
    updateAbsencesProgramChart(absencesData); // Add this line
    loadStudents();
    updateStudentsStats();
    updateProgramChart();

    // Check for today's absences notification
    checkTodayAbsences();

    // Close modal
    closeAbsenceModal();

    // Clear form
    document.getElementById('absence-form').reset();

    addRecentActivity('absence-added', `Absence logged for "${studentName}" - ${subject}`);
    showSuccess('Absence added successfully!');
}

// Modified deleteAbsence function
function deleteAbsence(absenceId) {
    const absence = absencesData.find(a => a.id === absenceId);
    if (!absence) return;

    showConfirm(`Are you sure you want to delete this absence record?`, 'Yes, delete it!')
        .then(result => {
            if (result.isConfirmed) {
                absencesData = absencesData.filter(a => a.id !== absenceId);
                localStorage.setItem('absencesData', JSON.stringify(absencesData));

                updateAbsencesTable(absencesData);
                updateStatistics();
                updateTodayAbsences();
                updateAbsencesProgramChart(absencesData); // Add this line
                loadStudents();
                updateStudentsStats();
                updateProgramChart();

                addRecentActivity('absence-deleted', `Absence record deleted for "${absence.studentName}"`);
                showSuccess('Absence deleted successfully!');
            }
        });
}
// Global variables for program absences modal
let currentProgramAbsences = '';
let currentFilteredAbsences = [];

// Function to open program absences details modal
function openProgramAbsencesDetails(programCode) {
    currentProgramAbsences = programCode;
    const programName = getProgramName(programCode);

    // Get current filtered absences (respect current filters)
    const programValue = document.getElementById('filter-program-absences').value;
    const studentValue = document.getElementById('filter-student-absences').value;
    const dateValue = document.getElementById('filter-date-range').value;

    // Get filtered absences for this program
    let filteredAbsences = absencesData.filter(absence => absence.program === programCode);

    // Apply current filters if any
    if (studentValue) {
        filteredAbsences = filteredAbsences.filter(a => a.studentName === studentValue);
    }

    if (dateValue !== 'all') {
        const today = new Date();
        filteredAbsences = filteredAbsences.filter(absence => {
            const absenceDate = new Date(absence.date);
            switch (dateValue) {
                case 'today':
                    return isSameDay(absenceDate, today);
                case 'yesterday':
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    return isSameDay(absenceDate, yesterday);
                case 'week':
                    const startOfWeek = getStartOfWeek(today);
                    return absenceDate >= startOfWeek;
                case 'month':
                    return absenceDate.getMonth() === today.getMonth() &&
                        absenceDate.getFullYear() === today.getFullYear();
                case 'year':
                    return absenceDate.getFullYear() === today.getFullYear();
                default:
                    return true;
            }
        });
    }

    currentFilteredAbsences = filteredAbsences;

    // Set modal title
    document.getElementById('program-absences-title').textContent = `${programName} - Absence Details (${filteredAbsences.length} absences)`;

    // Get students in this program
    const programStudents = studentsData.filter(student => student.program === programCode);

    // Update statistics
    document.getElementById('program-absences-total-students').textContent = programStudents.length;
    document.getElementById('program-absences-total-count').textContent = filteredAbsences.length;

    // Calculate average absences per student
    const avg = programStudents.length > 0 ? (filteredAbsences.length / programStudents.length).toFixed(1) : 0;
    document.getElementById('program-absences-average').textContent = avg;

    // Generate level distribution
    generateProgramAbsencesLevelDistribution(programStudents, filteredAbsences);

    // Load students table
    loadProgramAbsencesStudentsTable(programStudents, filteredAbsences);

    // Show modal
    document.getElementById('program-absences-details-modal').style.display = 'flex';
}

// Function to generate level distribution for program absences
function generateProgramAbsencesLevelDistribution(students, absences) {
    const levelBars = document.getElementById('program-absences-level-bars');
    levelBars.innerHTML = '';

    // Count students by level
    const levelCounts = {
        '1ere': { students: 0, absences: 0 },
        '2eme': { students: 0, absences: 0 },
        '3eme': { students: 0, absences: 0 }
    };

    students.forEach(student => {
        if (levelCounts[student.level]) {
            levelCounts[student.level].students++;
        }
    });

    absences.forEach(absence => {
        const student = studentsData.find(s => s.name === absence.studentName);
        if (student && levelCounts[student.level]) {
            levelCounts[student.level].absences++;
        }
    });

    // Calculate percentages and create bars
    const totalStudents = students.length;
    const totalAbsences = absences.length;

    Object.entries(levelCounts).forEach(([level, data]) => {
        if (data.students > 0) {
            const studentPercentage = totalStudents > 0 ? Math.round((data.students / totalStudents) * 100) : 0;
            const absencePercentage = totalAbsences > 0 ? Math.round((data.absences / totalAbsences) * 100) : 0;

            const levelBar = document.createElement('div');
            levelBar.className = 'level-bar-item';
            levelBar.innerHTML = `
                <div class="level-bar-header">
                    <span class="level-name">${getLevelName(level)}</span>
                    <span class="level-count">${data.students} students • ${data.absences} absences</span>
                </div>
                <div class="level-bar-container" style="margin-bottom: 5px;">
                    <div class="level-bar-fill" style="width: ${studentPercentage}%; background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%);"></div>
                </div>
                <div class="level-bar-container">
                    <div class="level-bar-fill" style="width: ${absencePercentage}%; background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);"></div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: #64748b; margin-top: 3px;">
                    <span>Students: ${studentPercentage}%</span>
                    <span>Absences: ${absencePercentage}%</span>
                </div>
            `;

            levelBars.appendChild(levelBar);
        }
    });
}

// Function to load program absences students table
function loadProgramAbsencesStudentsTable(students, absences) {
    const tbody = document.getElementById('program-absences-students-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (students.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="no-data">
                    No students found in this program
                </td>
            </tr>
        `;
        return;
    }

    // Sort by absences count (descending)
    const studentsWithAbsences = students.map(student => {
        const studentAbsences = absences.filter(a => a.studentName === student.name);
        const lastAbsence = studentAbsences.length > 0
            ? studentAbsences.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
            : null;

        return {
            ...student,
            absenceCount: studentAbsences.length,
            lastAbsence: lastAbsence
        };
    }).sort((a, b) => b.absenceCount - a.absenceCount);

    studentsWithAbsences.forEach(student => {
        const row = document.createElement('tr');

        let statusClass = 'good';
        if (student.absenceCount >= 10 && student.absenceCount < 20) {
            statusClass = 'warning';
        } else if (student.absenceCount >= 20) {
            statusClass = 'critical';
        }

        row.innerHTML = `
            <td>
                <div class="student-user" onclick="openStudentProfile(${student.id})" style="cursor: pointer;">
                    <img src="${student.avatar}" alt="${student.name}">
                    <span>${student.name}</span>
                </div>
            </td>
            <td>
                <span class="level-badge level-${student.level}">
                    ${getLevelName(student.level)}
                </span>
            </td>
            <td>
                <div class="absence-status-container">
                    <div class="absence-status ${statusClass}"></div>
                    <span style="font-weight: 600;">${student.absenceCount}</span>
                </div>
            </td>
            <td>
                ${student.lastAbsence
                ? `<div style="display: flex; flex-direction: column;">
                        <span><i class="far fa-calendar" style="margin-right: 5px; color: #4f46e5;"></i>${formatDate(student.lastAbsence.date)}</span>
                        <span style="font-size: 0.75rem; color: #64748b;">${student.lastAbsence.reason}</span>
                       </div>`
                : '<span style="color: #94a3b8;">No absences</span>'
            }
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view-btn" onclick="addAbsenceForStudent(${student.id})" style="padding: 4px 8px; font-size: 0.75rem;">
                        <i class="fas fa-calendar-times"></i> Add
                    </button>
                    <button class="action-btn edit-btn" onclick="editStudent(${student.id})" style="padding: 4px 8px; font-size: 0.75rem;">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        `;

        tbody.appendChild(row);
    });
}

// Function to filter program absences students by level
function filterProgramAbsencesStudents() {
    const levelFilter = document.getElementById('filter-program-absences-level').value;
    const programStudents = studentsData.filter(student => student.program === currentProgramAbsences);

    let filteredStudents = programStudents;
    if (levelFilter) {
        filteredStudents = programStudents.filter(student => student.level === levelFilter);
    }

    loadProgramAbsencesStudentsTable(filteredStudents, currentFilteredAbsences);
}

// Function to close program absences modal
function closeProgramAbsencesModal() {
    document.getElementById('program-absences-details-modal').style.display = 'none';
    currentProgramAbsences = '';
    currentFilteredAbsences = [];
}

// Modified updateAbsencesProgramChart function to make it clickable
function updateAbsencesProgramChart(filteredAbsences = absencesData) {
    const ctx = document.getElementById('absencesProgramChart');
    if (!ctx) return;

    // Destroy existing chart
    if (absencesProgramChart) {
        absencesProgramChart.destroy();
    }

    // Calculate program distribution from filtered absences
    const programCounts = {};
    filteredAbsences.forEach(absence => {
        programCounts[absence.program] = (programCounts[absence.program] || 0) + 1;
    });

    const programs = Object.keys(programCounts);
    const programNames = programs.map(p => getProgramName(p));
    const counts = Object.values(programCounts);

    // If no data, show message
    if (programs.length === 0) {
        ctx.parentElement.innerHTML = `
            <div style="height: 200px; display: flex; align-items: center; justify-content: center; color: #94a3b8;">
                <i class="fas fa-chart-pie" style="margin-right: 10px;"></i>
                No data to display
            </div>
        `;
        return;
    }

    // Colors for programs
    const backgroundColors = [
        'rgba(79, 70, 229, 0.8)',
        'rgba(99, 102, 241, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(217, 70, 239, 0.8)',
        'rgba(236, 72, 153, 0.8)'
    ];

    // Create chart with click handler
    absencesProgramChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: programNames,
            datasets: [{
                data: counts,
                backgroundColor: backgroundColors.slice(0, programs.length),
                borderColor: backgroundColors.map(c => c.replace('0.8', '1')),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        generateLabels: (chart) => {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, i) => {
                                    const value = data.datasets[0].data[i];
                                    const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                    return {
                                        text: `${label}: ${value} (${percentage}%)`,
                                        fillStyle: backgroundColors[i % backgroundColors.length],
                                        strokeStyle: backgroundColors[i % backgroundColors.length].replace('0.8', '1'),
                                        lineWidth: 2,
                                        hidden: false,
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} absences (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '60%',
            onClick: (evt, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const programCode = programs[index];
                    openProgramAbsencesDetails(programCode);
                }
            }
        }
    });
}

// Update closeAllModals function
function closeAllModals() {
    closeEditModal();
    closeAbsenceModal();
    closeDayDetailsModal();
    closeProgramDetailsModal();
    closeProgramAbsencesModal(); // Add this line
}