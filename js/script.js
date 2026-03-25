document.addEventListener('DOMContentLoaded', () => {
    // Reveal animations on scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));

    // D-Day Countdown
    const ddayCount = document.getElementById('dday-count');
    if (ddayCount) {
        // 예식일시 (2026년 6월 6일 오후 1시)
        const weddingDate = new Date('2026-06-06T13:00:00');
        const today = new Date();
        const diffTime = weddingDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        ddayCount.innerText = diffDays > 0 ? diffDays : (diffDays === 0 ? 'Day' : '+' + Math.abs(diffDays));
    }

    // Accordions
    const accordions = document.querySelectorAll('.accordion-header');
    accordions.forEach(acc => {
        acc.addEventListener('click', function () {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
});

// Lightbox functionality
let currentImageIndex = 0;
let galleryImages = [];

function getGalleryImages() {
    return Array.from(document.querySelectorAll('.gallery-item img')).map(img => img.src);
}

function openLightbox(element) {
    galleryImages = getGalleryImages();
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const imageSrc = element.querySelector('img').src;

    currentImageIndex = galleryImages.indexOf(imageSrc);
    if (currentImageIndex === -1) currentImageIndex = 0; // fallback

    lightbox.style.display = 'block';
    lightboxImg.src = imageSrc;

    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function prevImage() {
    if (galleryImages.length === 0) galleryImages = getGalleryImages();
    if (galleryImages.length === 0) return;

    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    document.getElementById('lightbox-img').src = galleryImages[currentImageIndex];
}

function nextImage() {
    if (galleryImages.length === 0) galleryImages = getGalleryImages();
    if (galleryImages.length === 0) return;

    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    document.getElementById('lightbox-img').src = galleryImages[currentImageIndex];
}

// Close lightbox on clicking outside image
document.getElementById('lightbox')?.addEventListener('click', function (e) {
    if (e.target !== document.getElementById('lightbox-img') &&
        !e.target.classList.contains('lightbox-prev') &&
        !e.target.classList.contains('lightbox-next')) {
        closeLightbox();
    }
});

// Lightbox swipe navigation for mobile
let touchstartX = 0;
let touchendX = 0;

function handleGesture() {
    if (touchendX < touchstartX - 40) nextImage();
    if (touchendX > touchstartX + 40) prevImage();
}

const lightboxEl = document.getElementById('lightbox');
if (lightboxEl) {
    lightboxEl.addEventListener('touchstart', e => {
        touchstartX = e.changedTouches[0].screenX;
    });

    lightboxEl.addEventListener('touchend', e => {
        touchendX = e.changedTouches[0].screenX;
        handleGesture();
    });
}

// Copy to clipboard
function copyText(elementId) {
    const accNumberElement = document.getElementById(elementId);
    if (!accNumberElement) return;
    
    // Get the previous sibling element which contains the bank name
    const bankElement = accNumberElement.previousElementSibling;
    const bankName = bankElement && bankElement.classList.contains('bank') 
                        ? bankElement.innerText.trim() 
                        : '';
    
    // Get the account number while keeping the dashes
    const accNumber = accNumberElement.innerText.trim();
    
    // Format: "국민은행 123-456-789"
    const textToCopy = bankName ? `${bankName} ${accNumber}` : accNumber;

    navigator.clipboard.writeText(textToCopy).then(() => {
        alert('계좌번호가 복사되었습니다:\n' + textToCopy);
    }).catch(err => {
        alert('복사 실패! 다시 시도해주세요.');
    });
}

// Kakao Share dummy function
function shareKakao() {
    if (!window.Kakao || !window.Kakao.isInitialized()) {
        alert('카카오톡 공유 기능은 도메인 연결 및 API 키 발급 후 활성화됩니다.\n(현재는 카카오톡 버튼 UI만 구현되어 있습니다.)');
        return;
    }

    Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
            title: '저희 결혼합니다! 모바일 청첩장',
            description: '웨딩의전당 1층 그랜드홀\n2026년 10월 24일 토요일 오후 1시',
            imageUrl: 'https://via.placeholder.com/800x400/ffebee/d32f2f?text=Wedding+Cover',
            link: {
                mobileWebUrl: window.location.href,
                webUrl: window.location.href,
            },
        },
        buttons: [
            {
                title: '모바일 청첩장 보기',
                link: {
                    mobileWebUrl: window.location.href,
                    webUrl: window.location.href,
                },
            },
        ],
    });
}

// Firebase Configuration & Guestbook Logic
const firebaseConfig = {
    apiKey: "AIzaSyBn8juiQvoJLEmn3t89EQu6Cadz7PTfy1M",
    authDomain: "wedding-guestbook-af093.firebaseapp.com",
    projectId: "wedding-guestbook-af093",
    storageBucket: "wedding-guestbook-af093.firebasestorage.app",
    messagingSenderId: "1033536610225",
    appId: "1:1033536610225:web:a83990ccad989a39262790",
    databaseURL: "https://wedding-guestbook-af093-default-rtdb.firebaseio.com" // Default US central database URL
};

if (!window.firebase) {
    console.error("Firebase SDK not loaded!");
} else if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();
const guestbookRef = db.ref('guestbook');

function loadGuestbook() {
    const listContainer = document.getElementById('guestbook-list');
    if (!listContainer) return;

    // Realtime connection to Firebase
    guestbookRef.on('value', (snapshot) => {
        listContainer.innerHTML = '';
        const data = snapshot.val();

        if (!data) {
            listContainer.innerHTML = '<p class="text-muted text-center" style="font-size: 0.85rem; padding: 20px;">첫 번째 축하 메시지를 남겨주세요!</p>';
            return;
        }

        // Convert data nested object to array, and sort by timestamp
        const entries = Object.values(data);
        entries.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        entries.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'guestbook-item fade-in visible';
            item.innerHTML = `
                <div class="gb-name">${escapeHTML(entry.name || '')}</div>
                <div class="gb-date">${entry.date || ''}</div>
                <div class="gb-msg">${escapeHTML(entry.message || '')}</div>
            `;
            listContainer.appendChild(item);
        });
    });
}

function addGuestbookEntry() {
    const nameInput = document.getElementById('gb-name');
    const pwdInput = document.getElementById('gb-pwd');
    const msgInput = document.getElementById('gb-message');

    const name = nameInput.value.trim();
    const pwd = pwdInput.value.trim();
    const msg = msgInput.value.trim();

    if (!name || !pwd || !msg) {
        alert('이름, 비밀번호, 메시지를 모두 입력해주세요.');
        return;
    }

    const newEntry = {
        name: name,
        password: pwd, 
        message: msg,
        date: new Date().toLocaleDateString('ko-KR'),
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    // Push new entry to Firebase
    guestbookRef.push(newEntry).then(() => {
        // Clear inputs
        nameInput.value = '';
        pwdInput.value = '';
        msgInput.value = '';
        alert('축하 메시지가 등록되었습니다.');
    }).catch(err => {
        alert('메시지 등록에 실패했습니다. (데이터베이스 권한 설정을 확인해주세요!)');
        console.error(err);
    });
}

// Simple HTML escaper to prevent XSS in guestbook
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// Naver Map Initialization
function initMap() {
    // 1. 역삼역 인근 예시 좌표 (실제 웨딩홀 좌표로 변경 필요)
    // 네이버 지도에서 웨딩홀 검색 후 URL 창이나 좌표 찾기 툴 등을 이용해 위도/경도를 찾으셔야 합니다.
    const venueLocation = new window.naver.maps.LatLng(37.57298217781866, 127.00121123880488);

    // 2. 지도가 들어갈 HTML 요소 찾기
    const mapElement = document.getElementById('map');

    if (mapElement && window.naver && window.naver.maps) {
        mapElement.innerHTML = ''; // 임시 안내 문구 제거
        const mapOptions = {
            center: venueLocation,
            zoom: 16, // 확대 정도 (필요에 따라 조절)
            minZoom: 14,
            zoomControl: true,
            zoomControlOptions: {
                style: window.naver.maps.ZoomControlStyle.SMALL,
                position: window.naver.maps.Position.TOP_RIGHT
            }
        };

        const map = new window.naver.maps.Map(mapElement, mapOptions);

        // 지도 가운데에 빨간 핀(마커) 표시
        new window.naver.maps.Marker({
            position: venueLocation,
            map: map
        });
    }
}

// Load guestbook on DOM load
document.addEventListener('DOMContentLoaded', () => {
    loadGuestbook();

    // 네이버 지도는 API 스크립트 로드 후 실행되어야 하므로 약간의 딜레이를 줍니다.
    setTimeout(() => {
        try {
            if (window.naver && window.naver.maps) {
                initMap();
            }
        } catch (e) {
            console.warn("네이버 지도 로드 실패 (API 키 설정을 확인해주세요)");
        }
    }, 500);
});

// RSVP Modal Logic
function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

document.addEventListener('DOMContentLoaded', () => {
    const rsvpModal = document.getElementById('rsvp-modal');
    if (rsvpModal) {
        // Check cookie
        if (!getCookie('hideRsvpModal')) {
            // Show after 2 seconds
            setTimeout(() => {
                rsvpModal.style.display = 'flex';
                document.body.style.overflow = 'hidden'; // Prevent scrolling under modal
            }, 2000);
        }
    }
});

function closeRsvpModal() {
    const rsvpModal = document.getElementById('rsvp-modal');
    const hideTodayCheckbox = document.getElementById('hide-today');
    
    if (hideTodayCheckbox && hideTodayCheckbox.checked) {
        setCookie('hideRsvpModal', 'true', 1); // Hide for 1 day
    }
    
    rsvpModal.style.display = 'none';
    document.body.style.overflow = 'auto'; // restore scroll
    
    // Reset view
    setTimeout(() => {
        document.getElementById('rsvp-intro').style.display = 'block';
        document.getElementById('rsvp-form-container').style.display = 'none';
        document.getElementById('rsvp-form').reset();
    }, 300);
}

function openRsvpForm() {
    document.getElementById('rsvp-intro').style.display = 'none';
    document.getElementById('rsvp-form-container').style.display = 'block';
}

function submitRsvp(event) {
    event.preventDefault();
    
    const submitBtn = document.querySelector('#rsvp-form button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "전달 중...";
    submitBtn.disabled = true;

    // Gather form data and map to Korean words
    const sideRaw = document.querySelector('input[name="side"]:checked')?.value;
    const side = sideRaw === 'groom' ? '신랑 측' : '신부 측';
    
    const attendRaw = document.querySelector('input[name="attend"]:checked')?.value;
    const attend = attendRaw === 'yes' ? '참석' : '불참석';
    
    const mealRaw = document.querySelector('input[name="meal"]:checked')?.value;
    let meal = '미정';
    if(mealRaw === 'yes') meal = '식사함 (O)';
    if(mealRaw === 'no') meal = '식사안함 (X)';
    
    const name = document.getElementById('rsvp-name').value;
    const companion = document.getElementById('rsvp-companion').value || '(없음)';
    const message = document.getElementById('rsvp-message').value || '(없음)';
    
    const templateParams = {
        side: side,
        attend: attend,
        meal: meal,
        name: name,
        companion: companion,
        message: message
    };
    
    emailjs.send("service_lrci34i", "template_30zixe3", templateParams)
        .then(function() {
            alert('참석 정보가 성공적으로 전달되었습니다.\n감사합니다!');
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
            closeRsvpModal();
        }, function(error) {
            alert('전달에 실패했습니다. 다시 시도해주세요.\n오류 코드: ' + JSON.stringify(error));
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        });
}

// --- BGM and Sparkle Effect ---
function createSparkles() {
    const coverPhoto = document.querySelector('.cover-image-container');
    if (!coverPhoto) return;
    
    for (let i = 0; i < 30; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        
        let x, y;
        let inFaceZone = true;
        
        // Keep generating coordinates to avoid the center area (faces)
        while (inFaceZone) {
            x = Math.random() * 100;
            y = Math.random() * 100;
            
            // The faces occupy the upper middle of the portrait photo
            // roughly x: 20% to 80%, y: 20% to 55%
            if (x > 15 && x < 85 && y > 15 && y < 55) {
                inFaceZone = true;
            } else {
                inFaceZone = false;
            }
        }
        
        sparkle.style.left = x + '%';
        sparkle.style.top = y + '%';
        sparkle.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
        sparkle.style.animationDelay = (Math.random() * 3) + 's';
        coverPhoto.appendChild(sparkle);
    }
}

function toggleBgm() {
    const bgm = document.getElementById('bgm');
    const btn = document.getElementById('bgm-btn');
    if (!bgm || !btn) return;
    
    if (bgm.paused) {
        bgm.play().then(() => {
            btn.classList.add('playing');
            btn.innerHTML = '🎵';
        }).catch(e => console.log('Audio play failed:', e));
    } else {
        bgm.pause();
        btn.classList.remove('playing');
        btn.innerHTML = '🔇';
        bgm.setAttribute('data-manual-pause', 'true');
    }
}

function initBgmOnInteract() {
    const bgm = document.getElementById('bgm');
    if (bgm && bgm.paused && !bgm.hasAttribute('data-manual-pause')) {
        bgm.play().then(() => {
            const btn = document.getElementById('bgm-btn');
            if (btn) {
                btn.classList.add('playing');
                btn.innerHTML = '🎵';
            }
        }).catch(err => console.log('BGM autoplay prevented until further interaction.'));
    }
    document.body.removeEventListener('click', initBgmOnInteract);
    document.body.removeEventListener('touchstart', initBgmOnInteract);
}

document.addEventListener('DOMContentLoaded', () => {
    createSparkles();
    document.body.addEventListener('click', initBgmOnInteract, { once: true });
    document.body.addEventListener('touchstart', initBgmOnInteract, { once: true });
});
