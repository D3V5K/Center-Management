document.addEventListener('DOMContentLoaded', function () {
    const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    const currentDate = new Date().toLocaleDateString('en-US', dateOptions);
    const currentDateElement = document.getElementById('current-date');
    // this condition is necessary to avoid falling into error
    if (currentDateElement) {
        currentDateElement.textContent = currentDate;
    };

    // switch section & active nav-link
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.page-section');
    // we use window for make the function global
    window.switchSection = function (sectionId) {
        sections.forEach(section => {
            section.classList.remove('active');
        });
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        };

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            };
        });
    };

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            let sectionId = this.getAttribute('data-section');
            window.switchSection(sectionId);
        });
    });

    // Initialize all
    initializeStudents();
    initializeAbsences();
    setupEventListeners();

    // Load recent activity
    loadRecentActivity();

    // Test switch to Absences section
    // window.switchSection('Absences');
});







let studentsData = JSON.parse(localStorage.getItem('studentsData')) || [];
let absencesData = JSON.parse(localStorage.getItem('absencesData')) || [];
let recentActivityData = JSON.parse(localStorage.getItem('recentActivityData')) || [];

// Student section
const InputName = document.getElementById('student-name');
const ProgramSelect = document.getElementById('student-program');
const levelSelect = document.getElementById('student-level');
const btnAddStudent = document.getElementById('add-student-btn');
const DivStudent = document.getElementById("students-table-body");
const totalStudents = document.getElementById('total-students-count');
const todayAbsences = document.getElementById('today-absences-count');
const searchInput = document.getElementById('search-students');
const programFilter = document.getElementById('filter-program');

function initializeStudents() {
    loadStudents();
    updateStudentCount();
    updateTodayAbsences();
}

function loadStudents() {
    if (!DivStudent) return;

    DivStudent.innerHTML = '';

    // if (studentsData.length === 0) {
    //     DivStudent.innerHTML = `
    //         <tr>
    //             <td colspan="6" class="no-data">No students found</td>
    //         </tr>
    //     `;
    //     return;
    // }

    studentsData.forEach(student => {
        createStudentRow(student);
    });
}


function createStudentRow(student) {
    const tr = document.createElement('tr');
    tr.dataset.studentId = student.id;

    // Name & Avatar
    let tdName = document.createElement('td');
    tdName.className = 'full-name';

    let userBox = document.createElement('div');
    userBox.className = 'student-user';

    let img = document.createElement('img');
    img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random&color=fff`;
    img.alt = student.name;

    let span = document.createElement('span');
    span.textContent = student.name;

    userBox.appendChild(img);
    userBox.appendChild(span);
    tdName.appendChild(userBox);

    // Program
    let tdProgram = document.createElement('td');
    tdProgram.className = 'program';
    tdProgram.textContent = getProgramName(student.program);

    // Level
    let tdLevel = document.createElement('td');
    tdLevel.textContent = student.level;
    tdLevel.className = `level level-${student.level}`;

    // Edit Button
    let tdEdit = document.createElement('td');
    tdEdit.className = 'actions';

    let editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.title = 'Edit Student';
    editBtn.onclick = function () {
        editStudent(student.id);
    };

    const editIcon = document.createElement('i');
    editIcon.classList.add('fas', 'fa-edit');
    editIcon.style.color = '#4CAF50';

    editBtn.appendChild(editIcon);
    tdEdit.appendChild(editBtn);

    // Add Absence Button
    let tdAddAbsence = document.createElement('td');
    tdAddAbsence.className = 'actions';

    let AddAbsenceBtn = document.createElement('button');
    AddAbsenceBtn.className = 'view-btn Add-AbsenceBtn';
    AddAbsenceBtn.title = 'Add Absence';
    AddAbsenceBtn.onclick = function () {
        addAbsenceForStudent(student.id);
    };

    const AddIcon = document.createElement('i');
    AddIcon.classList.add('fas', 'fa-user-plus');
    AddIcon.style.color = '#2196F3';

    AddAbsenceBtn.appendChild(AddIcon);
    tdAddAbsence.appendChild(AddAbsenceBtn);

    // Remove Button
    let tdRemove = document.createElement('td');
    tdRemove.className = 'actions';

    let RemoveBtn = document.createElement('button');
    RemoveBtn.className = 'view-btn Remove';
    RemoveBtn.title = 'Remove Student';
    RemoveBtn.onclick = function () {
        removeStudent(student.id);
    };

    const RemoveIcon = document.createElement('i');
    RemoveIcon.classList.add('fas', 'fa-user-minus');
    RemoveIcon.style.color = '#dc3545';

    RemoveBtn.appendChild(RemoveIcon);
    tdRemove.appendChild(RemoveBtn);

    // Append all 
    tr.appendChild(tdName);
    tr.appendChild(tdProgram);
    tr.appendChild(tdLevel);
    tr.appendChild(tdEdit);
    tr.appendChild(tdAddAbsence);
    tr.appendChild(tdRemove);

    if (DivStudent) DivStudent.appendChild(tr);
}



// function displayStudent() {
//     if (!InputName || !ProgramSelect || !levelSelect) return;

//     const name = InputName.value.trim();
//     const program = ProgramSelect.value;
//     const level = levelSelect.value;

//     if (!name || !program || !level) {
//         alert('Please fill in all fields');
//         return;
//     }

//     // Generate new student ID
//     const newId = studentsData.length > 0 ? 
//         Math.max(...studentsData.map(s => s.id)) + 1 : 1;

//     // Create student object
//     const newStudent = {
//         id: newId,
//         name: name,
//         program: program,
//         level: level,
//         avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`
//     };

//     // Add to data
//     studentsData.push(newStudent);

//     // Save to localStorage
//     localStorage.setItem('studentsData', JSON.stringify(studentsData));

//     // Add to table
//     createStudentRow(newStudent);

//     // Clear form
//     InputName.value = '';
//     ProgramSelect.selectedIndex = 0;
//     levelSelect.selectedIndex = 0;

//     // Update count
//     updateStudentCount();

//     // Add to recent activity
//     addRecentActivity('student-added', `New student "${name}" registered`, new Date());

//     alert('Student added successfully!');
// }

// edit student



// function editStudent(studentId) {
//     const student = studentsData.find(s => s.id === studentId);
//     if (!student) {
//         alert('Student not found!');
//         return;
//     }

//     // Fill form with student data
//     document.getElementById('edit-student-id').value = student.id;
//     document.getElementById('edit-student-name').value = student.name;
//     document.getElementById('edit-student-program').value = student.program;
//     document.getElementById('edit-student-level').value = student.level;

//     // Open modal
//     openEditModal();
// }

async function displayStudent() {
    // خذ القيم مباشرة
    const name = document.getElementById('student-name').value.trim();
    const program = document.getElementById('student-program').value;
    const level = document.getElementById('student-level').value;

    // Check if any field is empty
    if (!name || !program || !level) {
        await showWarning('Please fill in all fields', 'Missing Information');
        return; // STOP
    }

    // Generate new student ID
    const newId = studentsData.length > 0 ? Math.max(...studentsData.map(s => s.id)) + 1 : 1;

    const newStudent = {
        id: newId,
        name,
        program,
        level,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`
    };

    // Add to data
    studentsData.push(newStudent);
    localStorage.setItem('studentsData', JSON.stringify(studentsData));

    // Add to table
    createStudentRow(newStudent);

    // Clear form
    document.getElementById('student-name').value = '';
    document.getElementById('student-program').selectedIndex = 0;
    document.getElementById('student-level').selectedIndex = 0;

    // Update count & activity
    updateStudentCount();
    addRecentActivity('student-added', `New student "${name}" registered`, new Date());

    await showSuccess('Student added successfully!');
}




async function editStudent(studentId) {
    const student = studentsData.find(s => s.id === studentId);
    if (!student) {
        await showError('Student not found!');
        return;
    }

    // Fill form with student data
    document.getElementById('edit-student-id').value = student.id;
    document.getElementById('edit-student-name').value = student.name;
    document.getElementById('edit-student-program').value = student.program;
    document.getElementById('edit-student-level').value = student.level;

    // Open modal
    openEditModal();
}

function openEditModal() {
    const modal = document.getElementById('edit-student-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('edit-student-name').focus();
    }
}

function closeEditModal() {
    const modal = document.getElementById('edit-student-modal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('edit-student-id').value = '';
        document.getElementById('edit-student-name').value = '';
        document.getElementById('edit-student-program').value = '';
        document.getElementById('edit-student-level').value = '';
    }
}
// save change in local storage and in the table
// function saveStudentChanges() {
//     const studentId = parseInt(document.getElementById('edit-student-id').value);
//     const name = document.getElementById('edit-student-name').value.trim();
//     const program = document.getElementById('edit-student-program').value;
//     const level = document.getElementById('edit-student-level').value;

//     if (!name || !program || !level) {
//         alert('Please fill all fields');
//         return;
//     }

//     // Find student
//     const student = studentsData.find(s => s.id === studentId);
//     if (!student) {
//         alert('Student not found!');
//         return;
//     }

//     // Store old name for activity 
//     const oldName = student.name;

//     // Update student data
//     student.name = name;
//     student.program = program;
//     student.level = level;
//     student.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;

//     // Save to localStorage
//     localStorage.setItem('studentsData', JSON.stringify(studentsData));

//     // Reload students table
//     loadStudents();

//     // Close modal
//     closeEditModal();

//     // Add to recent activity
//     addRecentActivity('student-edited', `Student "${oldName}" updated to "${name}"`, new Date());

//     alert('Student updated successfully!');
// }
async function saveStudentChanges() {
    const studentId = parseInt(document.getElementById('edit-student-id').value);
    const name = document.getElementById('edit-student-name').value.trim();
    const program = document.getElementById('edit-student-program').value;
    const level = document.getElementById('edit-student-level').value;

    if (!name || !program || !level) {
        await showWarning('Please fill all fields', 'Missing Information');
        return;
    }

    // Find student
    const student = studentsData.find(s => s.id === studentId);
    if (!student) {
        await showError('Student not found!');
        return;
    }

    // Store old name for activity log
    const oldName = student.name;

    // Update student data
    student.name = name;
    student.program = program;
    student.level = level;
    student.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;

    // Save to localStorage
    localStorage.setItem('studentsData', JSON.stringify(studentsData));

    // Reload students table
    loadStudents();

    // Close modal
    closeEditModal();

    // Add to recent activity
    addRecentActivity('student-edited', `Student "${oldName}" updated to "${name}"`, new Date());

    await showSuccess('Student updated successfully!');
}


function setupEventListeners() {
    // Student form button
    if (btnAddStudent) {
        btnAddStudent.addEventListener('click', displayStudent);
    }

    // Student search
    if (searchInput) {
        searchInput.addEventListener('keyup', filterStudents);
    }

    // Student program filter
    if (programFilter) {
        programFilter.addEventListener('change', filterByProgram);
    }

    // Absence filters
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }

    // Simple absence modal form
    const simpleAbsenceForm = document.getElementById('simple-absence-form');
    if (simpleAbsenceForm) {
        simpleAbsenceForm.addEventListener('submit', handleAbsenceSubmit);
    }

    // Modal close buttons
    const closeSimpleBtn = document.querySelector('#simple-absence-modal .close-btn');
    const closeEditBtn = document.querySelector('#edit-student-modal .close-btn');

    if (closeSimpleBtn) {
        closeSimpleBtn.addEventListener('click', closeSimpleModal);
    }

    if (closeEditBtn) {
        closeEditBtn.addEventListener('click', closeEditModal);
    }

    // Close modal when clicking outside
    const simpleModal = document.getElementById('simple-absence-modal');
    const editModal = document.getElementById('edit-student-modal');

    if (simpleModal) {
        window.addEventListener('click', function (event) {
            if (event.target === simpleModal) {
                closeSimpleModal();
            }
        });
    }

    if (editModal) {
        window.addEventListener('click', function (event) {
            if (event.target === editModal) {
                closeEditModal();
            }
        });
    }
    if (searchInput) {
        searchInput.addEventListener('input', filterStudentsCombined);

    }
     if (programFilter) {
        searchInput.addEventListener('change', filterStudentsCombined);

    }


    // Allow pressing Enter to save in edit modal
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && document.getElementById('edit-student-modal').style.display === 'flex') {
            event.preventDefault();
            saveStudentChanges();
        }

        if (event.key === 'Escape' && document.getElementById('edit-student-modal').style.display === 'flex') {
            closeEditModal();
        }
    });
}

// function removeStudent(studentId) {
//     if (!confirm('Are you sure you want to remove this student?')) return;

//     const student = studentsData.find(s => s.id === studentId);

//     // Remove from data
//     studentsData = studentsData.filter(student => student.id !== studentId);

//     // Save to localStorage
//     localStorage.setItem('studentsData', JSON.stringify(studentsData));

//     // Remove from DOM
//     const row = document.querySelector(`tr[data-student-id="${studentId}"]`);
//     if (row) row.remove();

//     // Update count
//     updateStudentCount();

//     // Add to recent activity
//     if (student) {
//         addRecentActivity('student-removed', `Student "${student.name}" removed from system`, new Date());
//     }

//     alert('Student removed successfully!');
// }
async function removeStudent(studentId) {
    const student = studentsData.find(s => s.id === studentId);
    if (!student) return;

    const result = await showConfirm(`Are you sure you want to remove "${student.name}"?`, 'Yes, remove it!');

    if (!result.isConfirmed) return;

    // Remove from data
    studentsData = studentsData.filter(student => student.id !== studentId);

    // Save to localStorage
    localStorage.setItem('studentsData', JSON.stringify(studentsData));

    // Remove from DOM
    const row = document.querySelector(`tr[data-student-id="${studentId}"]`);
    if (row) row.remove();

    // Update count
    updateStudentCount();

    // Add to recent activity
    addRecentActivity('student-removed', `Student "${student.name}" removed from system`, new Date());

    await showSuccess('Student removed successfully!');
}

function updateStudentCount() {
    if (totalStudents) {
        totalStudents.textContent = studentsData.length;
    }
}

function updateTodayAbsences() {
    if (!todayAbsences) return;

    const today = new Date().toISOString().split('T')[0];
    const todayAbsencesCount = absencesData.filter(absence => absence.date === today).length;

    todayAbsences.textContent = todayAbsencesCount;
}

function filterStudents() {
    if (!searchInput) return;

    const searchValue = searchInput.value.toLowerCase();
    const rows = document.querySelectorAll('#students-table-body tr[data-student-id]');

    rows.forEach(row => {
        const studentName = row.querySelector('.full-name span').textContent.toLowerCase();
        if (studentName.includes(searchValue)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function filterByProgram() {
    if (!programFilter) return;

    const selectedProgram = programFilter.value;
    const rows = document.querySelectorAll('#students-table-body tr[data-student-id]');

    rows.forEach(row => {
        const studentProgram = row.querySelector('.program').textContent.toLowerCase();
        const programName = getProgramName(selectedProgram).toLowerCase();
        if (selectedProgram === '' || studentProgram === programName) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function filterStudentsCombined() {
    if (!searchInput || !programFilter) return;

    const searchValue = searchInput.value.toLowerCase();
    const selectedProgram = programFilter.value.toLowerCase();

    const rows = document.querySelectorAll('#students-table-body tr[data-student-id]');

    rows.forEach(row => {
        const studentName = row.querySelector('.full-name span').textContent.toLowerCase();
        const studentProgram = row.querySelector('.program').textContent.toLowerCase();
        const programName = getProgramName(selectedProgram).toLowerCase();

        // condition: match smiya w match program
        const matchName = studentName.includes(searchValue);
        const matchProgram = selectedProgram === '' || studentProgram === programName;

        if (matchName && matchProgram) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Function to add absence for a specific student
function addAbsenceForStudent(studentId) {
    const student = studentsData.find(s => s.id === studentId);
    if (!student) return;

    // Switch to Absences section
    window.switchSection('Absences');

    // Open the modal with student info
    openAbsenceModalWithStudent(student);
}

// RECENT ACTIVITY

function loadRecentActivity() {
    const activityList = document.querySelector('.activity-list');
    if (!activityList) return;

    // Clear current activities
    activityList.innerHTML = '';

    // Sort activities by timestamp (newest first)
    recentActivityData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Display only latest 3 activities
    const latestActivities = recentActivityData.slice(0, 3);

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
        if (activity.type === 'student-added') iconClass = 'fas fa-user-plus';
        else if (activity.type === 'student-edited') iconClass = 'fas fa-edit';
        else if (activity.type === 'student-removed') iconClass = 'fas fa-user-minus';
        else if (activity.type === 'absence-added') iconClass = 'fas fa-calendar-times';
        else if (activity.type === 'absence-removed') iconClass = 'fas fa-trash';

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

function addRecentActivity(type, message, timestamp) {
    const newActivity = {
        id: recentActivityData.length + 1,
        type: type,
        message: message,
        timestamp: timestamp
    };

    recentActivityData.unshift(newActivity);

    // Keep only last 20 activities
    if (recentActivityData.length > 20) {
        recentActivityData.pop();
    }

    localStorage.setItem('recentActivityData', JSON.stringify(recentActivityData));

    // Reload recent activity
    loadRecentActivity();
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const activityDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now - activityDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return activityDate.toLocaleDateString();
}

// Absence Section
let filteredAbsences = [...absencesData];

function initializeAbsences() {
    updateAbsencesTable(absencesData);
    updateStatistics();
    updateTodayAbsences();
}

function setupEventListeners() {
    // Student form button
    if (btnAddStudent) {
        btnAddStudent.addEventListener('click', displayStudent);
    }

    // Student search
    if (searchInput) {
        searchInput.addEventListener('keyup', filterStudents);
    }

    // Student program filter
    if (programFilter) {
        programFilter.addEventListener('change', filterByProgram);
    }

    // Absence filters
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }

    // Simple absence modal form
    const simpleAbsenceForm = document.getElementById('simple-absence-form');
    if (simpleAbsenceForm) {
        simpleAbsenceForm.addEventListener('submit', handleAbsenceSubmit);
    }

    // Modal close buttons
    const closeSimpleBtn = document.querySelector('#simple-absence-modal .close-btn');
    if (closeSimpleBtn) {
        closeSimpleBtn.addEventListener('click', closeSimpleModal);
    }

    // Close modal when clicking outside
    const simpleModal = document.getElementById('simple-absence-modal');
    if (simpleModal) {
        window.addEventListener('click', function (event) {
            if (event.target === simpleModal) {
                closeSimpleModal();
            }
        });
    }
}

// Function to open modal with student info
function openAbsenceModalWithStudent(student) {
    const simpleStudent = document.getElementById('simple-student');
    const simpleDate = document.getElementById('simple-date');
    const simpleTime = document.getElementById('simple-time');

    if (simpleStudent) simpleStudent.value = student.name;
    if (simpleDate) simpleDate.value = getTodayDate();
    if (simpleTime) simpleTime.value = getCurrentTime();

    openAbsenceModal();
}

function openAbsenceModal() {
    const modal = document.getElementById('simple-absence-modal');
    if (modal) {
        modal.style.display = 'flex';

        // Set current date and time if not already set
        const simpleDate = document.getElementById('simple-date');
        const simpleTime = document.getElementById('simple-time');

        if (simpleDate && !simpleDate.value) {
            simpleDate.value = getTodayDate();
        }

        if (simpleTime && !simpleTime.value) {
            simpleTime.value = getCurrentTime();
        }
    }
}

function closeSimpleModal() {
    const modal = document.getElementById('simple-absence-modal');
    if (modal) {
        modal.style.display = 'none';
    }

    const simpleAbsenceForm = document.getElementById('simple-absence-form');
    if (simpleAbsenceForm) {
        simpleAbsenceForm.reset();
    }
}

function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// function handleAbsenceSubmit(event) {
//     event.preventDefault();

//     const simpleStudent = document.getElementById('simple-student');
//     const simpleDate = document.getElementById('simple-date');
//     const simpleTime = document.getElementById('simple-time');
//     const simpleReason = document.getElementById('simple-reason');

//     if (!simpleStudent || !simpleDate || !simpleTime || !simpleReason) return;

//     const studentName = simpleStudent.value.trim();
//     const date = simpleDate.value;
//     const time = simpleTime.value;
//     const reasonText = simpleReason.value.trim();

//     if (!studentName || !date || !time || !reasonText) {
//         alert('Please fill all fields');
//         return;
//     }

//     // Generate new ID
//     const newId = absencesData.length > 0 ?
//         Math.max(...absencesData.map(a => a.id)) + 1 : 1;

//     // Find student to get their program
//     const student = studentsData.find(s => s.name === studentName);
//     const program = student ? student.program : "Unknown";

//     // Create new absence
//     const newAbsence = {
//         id: newId,
//         studentName: studentName,
//         studentAvatar: student ? student.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=random&color=fff`,
//         program: program,
//         date: date,
//         time: time,
//         reason: reasonText
//     };

//     // Add to data
//     absencesData.push(newAbsence);

//     // Save to localStorage
//     localStorage.setItem('absencesData', JSON.stringify(absencesData));

//     // Update table and stats
//     updateAbsencesTable(absencesData);
//     updateStatistics();
//     updateTodayAbsences();

//     // Add to recent activity
//     addRecentActivity('absence-added', `Absence logged for "${studentName}"`, new Date());

//     // Close modal
//     closeSimpleModal();

//     alert('Absence added successfully!');
// }
async function handleAbsenceSubmit(event) {
    event.preventDefault();

    const simpleStudent = document.getElementById('simple-student');
    const simpleDate = document.getElementById('simple-date');
    const simpleTime = document.getElementById('simple-time');
    const simpleReason = document.getElementById('simple-reason');

    if (!simpleStudent || !simpleDate || !simpleTime || !simpleReason) return;

    const studentName = simpleStudent.value.trim();
    const date = simpleDate.value;
    const time = simpleTime.value;
    const reasonText = simpleReason.value.trim();

    if (!studentName || !date || !time || !reasonText) {
        await showWarning('Please fill all fields', 'Missing Information');
        return;
    }

    // Generate new ID
    const newId = absencesData.length > 0 ?
        Math.max(...absencesData.map(a => a.id)) + 1 : 1;

    // Find student to get their program
    const student = studentsData.find(s => s.name === studentName);
    const program = student ? student.program : "Unknown";

    // Create new absence
    const newAbsence = {
        id: newId,
        studentName: studentName,
        studentAvatar: student ? student.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=random&color=fff`,
        program: program,
        date: date,
        time: time,
        reason: reasonText
    };

    // Add to data
    absencesData.push(newAbsence);

    // Save to localStorage
    localStorage.setItem('absencesData', JSON.stringify(absencesData));

    // Update table and stats
    updateAbsencesTable(absencesData);
    updateStatistics();
    updateTodayAbsences();

    // Add to recent activity
    addRecentActivity('absence-added', `Absence logged for "${studentName}"`, new Date());

    // Close modal
    closeSimpleModal();

    await showSuccess('Absence added successfully!');
}

function applyFilters() {
    const programFilter = document.getElementById('filter-program-absences');
    const dateFilter = document.getElementById('filter-date-range');

    if (!programFilter || !dateFilter) return;

    const programValue = programFilter.value;
    const dateValue = dateFilter.value;

    // Filter les données
    filteredAbsences = absencesData.filter(absence => {
        // Filter by program
        if (programValue && absence.program !== programValue) {
            return false;
        }

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

    // Update la table
    updateAbsencesTable(filteredAbsences);

    // Update filtered count
    updateStatistics();
}

function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear();
}

function getStartOfWeek(date) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(date);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
}

function clearFilters() {
    const programFilter = document.getElementById('filter-program-absences');
    const dateFilter = document.getElementById('filter-date-range');

    if (programFilter) programFilter.value = '';
    if (dateFilter) dateFilter.value = 'all';

    filteredAbsences = [...absencesData];
    updateAbsencesTable(absencesData);
    updateStatistics();
}

// Global functions for delete (UPDATED)
window.deleteAbsence = async function (id) {
    const absence = absencesData.find(a => a.id === id);
    if (!absence) return;

    const result = await showConfirm(`Are you sure you want to delete this absence record for "${absence.studentName}"?`, 'Yes, delete it!');

    if (!result.isConfirmed) return;

    // Remove from data
    absencesData = absencesData.filter(a => a.id !== id);
    filteredAbsences = filteredAbsences.filter(a => a.id !== id);

    // Save to localStorage
    localStorage.setItem('absencesData', JSON.stringify(absencesData));

    // Update table and stats
    updateAbsencesTable(filteredAbsences);
    updateStatistics();
    updateTodayAbsences();

    // Add to recent activity
    addRecentActivity('absence-removed', `Absence record removed for "${absence.studentName}"`, new Date());

    await showSuccess('Absence deleted successfully!');
};

function updateAbsencesTable(data) {
    const tbody = document.getElementById('absences-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="no-data">No absences found</td>
            </tr>
        `;
        return;
    }

    data.forEach(absence => {
        const row = document.createElement('tr');
        row.dataset.absenceId = absence.id;

        // Student cell with avatar
        let tdStudent = document.createElement('td');
        tdStudent.className = 'student-cell';

        let studentDiv = document.createElement('div');
        studentDiv.className = 'student-info';

        let avatar = document.createElement('img');
        avatar.src = absence.studentAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(absence.studentName)}&background=random&color=fff`;
        avatar.alt = absence.studentName;
        avatar.className = 'student-avatar';

        let infoDiv = document.createElement('div');
        infoDiv.className = 'student-details';

        let nameSpan = document.createElement('span');
        nameSpan.className = 'student-name';
        nameSpan.textContent = absence.studentName;

        let programSpan = document.createElement('span');
        programSpan.className = 'student-program';
        programSpan.textContent = getProgramName(absence.program);

        infoDiv.appendChild(nameSpan);
        infoDiv.appendChild(programSpan);

        studentDiv.appendChild(avatar);
        studentDiv.appendChild(infoDiv);
        tdStudent.appendChild(studentDiv);

        // Date
        let tdDate = document.createElement('td');
        tdDate.textContent = formatDate(absence.date);

        // Time
        let tdTime = document.createElement('td');
        tdTime.textContent = absence.time;

        // Reason
        let tdReason = document.createElement('td');

        let reasonBadge = document.createElement('span');
        reasonBadge.className = 'reason-badge';
        reasonBadge.textContent = absence.reason;

        tdReason.appendChild(reasonBadge);

        // Actions - فقط حذف (بدون تعديل)
        let tdActions = document.createElement('td');

        let actionDiv = document.createElement('div');
        actionDiv.className = 'action-buttons';

        // زر الحذف فقط
        let deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.title = 'Delete Absence';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.onclick = function () {
            deleteAbsence(absence.id);
        };

        actionDiv.appendChild(deleteBtn);
        tdActions.appendChild(actionDiv);

        row.appendChild(tdStudent);
        row.appendChild(tdDate);
        row.appendChild(tdTime);
        row.appendChild(tdReason);
        row.appendChild(tdActions);

        tbody.appendChild(row);
    });
}

function updateStatistics() {
    const totalCountElement = document.getElementById('total-abs-count');
    const filteredCountElement = document.getElementById('filtered-abs-count');

    if (totalCountElement) {
        totalCountElement.textContent = absencesData.length;
    }

    if (filteredCountElement) {
        filteredCountElement.textContent = filteredAbsences.length;
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

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

// Global functions for delete
window.deleteAbsence = function (id) {
    if (!confirm('Are you sure you want to delete this absence record?')) return;

    const absence = absencesData.find(a => a.id === id);

    // Remove from data
    absencesData = absencesData.filter(a => a.id !== id);
    filteredAbsences = filteredAbsences.filter(a => a.id !== id);

    // Save to localStorage
    localStorage.setItem('absencesData', JSON.stringify(absencesData));

    // Update table and stats
    updateAbsencesTable(filteredAbsences);
    updateStatistics();
    updateTodayAbsences();

    // Add to recent activity
    if (absence) {
        addRecentActivity('absence-removed', `Absence record removed for "${absence.studentName}"`, new Date());
    }

    alert('Absence deleted successfully!');
};

// Sweet Alert func

async function showConfirm(message, confirmButtonText = 'Yes') {
    return Swal.fire({
        title: 'Are you sure?',
        text: message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#4f46e5',
        cancelButtonColor: '#dc3545',
        confirmButtonText: confirmButtonText,
        cancelButtonText: 'Cancel',
        reverseButtons: true
    });
}

function showSuccess(message, title = 'Success!') {
    Swal.fire({
        title: title,
        text: message,
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 2000,
        timerProgressBar: true
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



// KEYBOARD SHORTCUTS

document.addEventListener('keydown', function (event) {
    // Ctrl + N for New Student
    if (event.ctrlKey && (event.key === 'M' || event.key === 'm')) {
        event.preventDefault();
        window.switchSection('Student');
        document.getElementById('student-name').focus();
    }

    // Ctrl + A for Add Absence
    if (event.ctrlKey && (event.key === 'A' || event.key === 'a')) {
        event.preventDefault();
        window.switchSection('Absences');
        openAbsenceModal();
    }

    // Enter to save in edit modal
    if (event.key === 'Enter' && document.getElementById('edit-student-modal').style.display === 'flex') {
        event.preventDefault();
        saveStudentChanges();
    }

    // Escape to close modals
    if (event.key === 'Escape') {
        if (document.getElementById('edit-student-modal').style.display === 'flex') {
            closeEditModal();
        }
        if (document.getElementById('simple-absence-modal').style.display === 'flex') {
            closeSimpleModal();
        }
    }
});




// Student profail function

function createStudentProfileModal() {
    if (document.getElementById('student-profile-modal')) return;

    const modalHTML = `
        <div id="student-profile-modal" class="modal" style="display: none;">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3><i class="fas fa-user-circle"></i> Student Profile</h3>
                    <span class="close-btn" onclick="closeProfileModal()">&times;</span>
                </div>
                <div class="modal-body">
                    <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px;">
                        <img id="profile-img" src="" alt="Student" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #4f46e5;">
                        <div>
                            <h2 id="profile-name" style="margin: 0 0 5px 0; color: #1e293b;">Student Name</h2>
                            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                <span id="profile-program" style="background: #e0e7ff; color: #4f46e5; padding: 4px 10px; border-radius: 20px; font-size: 14px;">Program</span>
                                <span id="profile-level" style="background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 20px; font-size: 14px;">Level</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <h4 style="margin: 0 0 10px 0; color: #475569;">Statistics</h4>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                            <div style="text-align: center;">
                                <div style="font-size: 24px; font-weight: bold; color: #4f46e5;" id="profile-absences-count">0</div>
                                <div style="font-size: 12px; color: #64748b;">Total Absences</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 24px; font-weight: bold; color: #10b981;" id="profile-id-display">#001</div>
                                <div style="font-size: 12px; color: #64748b;">Student ID</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 10px;">
                        <button onclick="editProfileStudent()" style="flex: 1; padding: 10px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <i class="fas fa-edit"></i> Edit Student
                        </button>
                        <button onclick="addAbsenceForProfileStudent()" style="flex: 1; padding: 10px; background: #4f46e5; color: white; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <i class="fas fa-calendar-plus"></i> Add Absence
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function openStudentProfile(studentId) {
    const student = studentsData.find(s => s.id === studentId);
    if (!student) {
        showError('Student not found!');
        return;
    }

    createStudentProfileModal();

    const studentAbsences = absencesData.filter(a => a.studentName === student.name);
    const absencesCount = studentAbsences.length;

    document.getElementById('profile-img').src = student.avatar;
    document.getElementById('profile-name').textContent = student.name;
    document.getElementById('profile-program').textContent = getProgramName(student.program);
    document.getElementById('profile-level').textContent = student.level;
    document.getElementById('profile-absences-count').textContent = absencesCount;
    document.getElementById('profile-id-display').textContent = `#${String(student.id).padStart(3, '0')}`;

    const modal = document.getElementById('student-profile-modal');
    modal.dataset.studentId = student.id;

    openProfileModal();
}

function openProfileModal() {
    const modal = document.getElementById('student-profile-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeProfileModal() {
    const modal = document.getElementById('student-profile-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function editProfileStudent() {
    const modal = document.getElementById('student-profile-modal');
    const studentId = parseInt(modal.dataset.studentId);

    closeProfileModal();
    editStudent(studentId);
}

function addAbsenceForProfileStudent() {
    const modal = document.getElementById('student-profile-modal');
    const studentId = parseInt(modal.dataset.studentId);

    closeProfileModal();
    addAbsenceForStudent(studentId);
}

function createStudentRow(student) {
    const tr = document.createElement('tr');
    tr.dataset.studentId = student.id;

    // Name & Avatar - جعلها قابلة للنقر
    let tdName = document.createElement('td');
    tdName.className = 'full-name';

    let userBox = document.createElement('div');
    userBox.className = 'student-user';
    userBox.style.cursor = 'pointer';
    userBox.onclick = function () {
        openStudentProfile(student.id);
    };
    userBox.title = 'Click to view student profile';

    let img = document.createElement('img');
    img.src = student.avatar;
    img.alt = student.name;
    img.style.cursor = 'pointer';

    let span = document.createElement('span');
    span.textContent = student.name;
    span.style.cursor = 'pointer';

    userBox.appendChild(img);
    userBox.appendChild(span);
    tdName.appendChild(userBox);

    // باقي الخلايا (البرنامج، المستوى، الأزرار)
    let tdProgram = document.createElement('td');
    tdProgram.className = 'program';
    tdProgram.textContent = getProgramName(student.program);

    let tdLevel = document.createElement('td');
    tdLevel.textContent = student.level;
    tdLevel.className = `level level-${student.level}`;

    // Edit Button
    let tdEdit = document.createElement('td');
    tdEdit.className = 'actions';

    let editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.title = 'Edit Student';
    editBtn.onclick = function () {
        editStudent(student.id);
    };

    const editIcon = document.createElement('i');
    editIcon.classList.add('fas', 'fa-edit');
    editIcon.style.color = '#4CAF50';

    editBtn.appendChild(editIcon);
    tdEdit.appendChild(editBtn);

    // Add Absence Button
    let tdAddAbsence = document.createElement('td');
    tdAddAbsence.className = 'actions';

    let AddAbsenceBtn = document.createElement('button');
    AddAbsenceBtn.className = 'view-btn Add-AbsenceBtn';
    AddAbsenceBtn.title = 'Add Absence';
    AddAbsenceBtn.onclick = function () {
        addAbsenceForStudent(student.id);
    };

    const AddIcon = document.createElement('i');
    AddIcon.classList.add('fas', 'fa-user-plus');
    AddIcon.style.color = '#2196F3';

    AddAbsenceBtn.appendChild(AddIcon);
    tdAddAbsence.appendChild(AddAbsenceBtn);

    // Remove Button
    let tdRemove = document.createElement('td');
    tdRemove.className = 'actions';

    let RemoveBtn = document.createElement('button');
    RemoveBtn.className = 'view-btn Remove';
    RemoveBtn.title = 'Remove Student';
    RemoveBtn.onclick = function () {
        removeStudent(student.id);
    };

    const RemoveIcon = document.createElement('i');
    RemoveIcon.classList.add('fas', 'fa-user-minus');
    RemoveIcon.style.color = '#dc3545';

    RemoveBtn.appendChild(RemoveIcon);
    tdRemove.appendChild(RemoveBtn);

    // Append all cells
    tr.appendChild(tdName);
    tr.appendChild(tdProgram);
    tr.appendChild(tdLevel);
    tr.appendChild(tdEdit);
    tr.appendChild(tdAddAbsence);
    tr.appendChild(tdRemove);

    if (DivStudent) DivStudent.appendChild(tr);
}

function updateAbsencesTable(data) {
    const tbody = document.getElementById('absences-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="no-data">No absences found</td>
            </tr>
        `;
        return;
    }

    data.forEach(absence => {
        const row = document.createElement('tr');
        row.dataset.absenceId = absence.id;

        // Student cell with avatar - جعلها قابلة للنقر
        let tdStudent = document.createElement('td');
        tdStudent.className = 'student-cell';

        let studentDiv = document.createElement('div');
        studentDiv.className = 'student-info';
        studentDiv.style.cursor = 'pointer';
        studentDiv.title = 'Click to view student profile';
        studentDiv.onclick = function () {
            // البحث عن الطالب باستخدام الاسم
            const student = studentsData.find(s => s.name === absence.studentName);
            if (student) {
                openStudentProfile(student.id);
            }
        };

        let avatar = document.createElement('img');
        avatar.src = absence.studentAvatar;
        avatar.alt = absence.studentName;
        avatar.className = 'student-avatar';
        avatar.style.cursor = 'pointer';

        let infoDiv = document.createElement('div');
        infoDiv.className = 'student-details';

        let nameSpan = document.createElement('span');
        nameSpan.className = 'student-name';
        nameSpan.textContent = absence.studentName;
        nameSpan.style.cursor = 'pointer';

        let programSpan = document.createElement('span');
        programSpan.className = 'student-program';
        programSpan.textContent = getProgramName(absence.program);

        infoDiv.appendChild(nameSpan);
        infoDiv.appendChild(programSpan);

        studentDiv.appendChild(avatar);
        studentDiv.appendChild(infoDiv);
        tdStudent.appendChild(studentDiv);

        // باقي الخلايا (التاريخ، الوقت، السبب، الزر)
        let tdDate = document.createElement('td');
        tdDate.textContent = formatDate(absence.date);

        let tdTime = document.createElement('td');
        tdTime.textContent = absence.time;

        let tdReason = document.createElement('td');

        let reasonBadge = document.createElement('span');
        reasonBadge.className = 'reason-badge';
        reasonBadge.textContent = absence.reason;

        tdReason.appendChild(reasonBadge);

        // Actions - زر الحذف فقط
        let tdActions = document.createElement('td');

        let actionDiv = document.createElement('div');
        actionDiv.className = 'action-buttons';

        // زر الحذف فقط
        let deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.title = 'Delete Absence';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.onclick = function () {
            deleteAbsence(absence.id);
        };

        actionDiv.appendChild(deleteBtn);
        tdActions.appendChild(actionDiv);

        row.appendChild(tdStudent);
        row.appendChild(tdDate);
        row.appendChild(tdTime);
        row.appendChild(tdReason);
        row.appendChild(tdActions);

        tbody.appendChild(row);
    });
}

function addProfileModalStyles() {
    if (!document.getElementById('profile-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'profile-modal-styles';
        style.textContent = `
            .student-user:hover, .student-info:hover {
                opacity: 0.8;
            }
            
            .student-user:hover span, .student-info:hover .student-name {
                color: #4f46e5 !important;
            }
            
            .student-user:hover img, .student-info:hover .student-avatar {
                transform: scale(1.05);
                transition: transform 0.2s;
            }
            
            #student-profile-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            
            #student-profile-modal .modal-content {
                background: white;
                border-radius: 12px;
                padding: 0;
                animation: modalFadeIn 0.3s ease;
                width: 90%;
                max-width: 500px;
            }
            
            @keyframes modalFadeIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            #student-profile-modal .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem 1.5rem;
                background-color: #4f46e5;
                color: white;
                border-radius: 12px 12px 0 0;
            }
            
            #student-profile-modal .modal-header h3 {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 1.125rem;
                color: white;
                margin: 0;
            }
            
            #student-profile-modal .modal-header .close-btn {
                font-size: 1.5rem;
                cursor: pointer;
                color: white;
                transition: color 0.2s;
            }
            
            #student-profile-modal .modal-header .close-btn:hover {
                color: #ddd;
            }
            
            #student-profile-modal .modal-body {
                padding: 1.5rem;
            }
        `;
        document.head.appendChild(style);
    }
}

document.addEventListener('DOMContentLoaded', function () {

    addProfileModalStyles();

    document.addEventListener('click', function (event) {
        const modal = document.getElementById('student-profile-modal');
        if (modal && modal.style.display === 'flex' && event.target === modal) {
            closeProfileModal();
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            const modal = document.getElementById('student-profile-modal');
            if (modal && modal.style.display === 'flex') {
                closeProfileModal();
            }
        }
    });
});