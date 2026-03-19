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
    const textToCopy = document.getElementById(elementId).innerText;
    // Remove dashes for exact account number format
    const cleanText = textToCopy.replace(/-/g, '');

    navigator.clipboard.writeText(cleanText).then(() => {
        alert('계좌번호가 복사되었습니다: ' + cleanText);
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

// Guestbook Logic using LocalStorage
const GUESTBOOK_KEY = 'wedding_guestbook_entries';

function loadGuestbook() {
    const listContainer = document.getElementById('guestbook-list');
    if (!listContainer) return;

    const entries = JSON.parse(localStorage.getItem(GUESTBOOK_KEY)) || [];
    listContainer.innerHTML = '';

    if (entries.length === 0) {
        listContainer.innerHTML = '<p class="text-muted text-center" style="font-size: 0.85rem; padding: 20px;">첫 번째 축하 메시지를 남겨주세요!</p>';
        return;
    }

    entries.reverse().forEach(entry => {
        const item = document.createElement('div');
        item.className = 'guestbook-item fade-in visible';
        item.innerHTML = `
            <div class="gb-name">${escapeHTML(entry.name)}</div>
            <div class="gb-date">${entry.date}</div>
            <div class="gb-msg">${escapeHTML(entry.message)}</div>
        `;
        listContainer.appendChild(item);
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
        password: pwd, // In a real app, this should be hashed. Here we store it plain for dummy purposes.
        message: msg,
        date: new Date().toLocaleDateString('ko-KR')
    };

    const entries = JSON.parse(localStorage.getItem(GUESTBOOK_KEY)) || [];
    entries.push(newEntry);
    localStorage.setItem(GUESTBOOK_KEY, JSON.stringify(entries));

    // Clear inputs
    nameInput.value = '';
    pwdInput.value = '';
    msgInput.value = '';

    alert('축하 메시지가 등록되었습니다.');
    loadGuestbook();
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
