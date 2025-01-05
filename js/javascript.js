window.addEventListener("load", function() {
    //プラグインを定義
    gsap.registerPlugin(ScrollTrigger);

    const area  = document.querySelector(".js-area");
    const wrap  = document.querySelector(".js-wrap");
    const items = document.querySelectorAll(".js-item");

    // 元の num を取得
    let num = items.length;

    // 画面幅による条件分岐
    if (window.innerWidth > 600) {
        num -= 1; // 600pxより大きい場合は num を減らす
    }

    // 横幅を指定
    gsap.set(wrap,  { width: num * 100 + "%" });
    gsap.set(items, { width: 100 / num + "%" });

    gsap.to(items, {
        xPercent: -100 * ( num - 1 ), // x方向に移動させる
        ease: "none",
        scrollTrigger: {
            trigger: area, // トリガー
            start: "top top", // 開始位置
            end: "+=5000", // 終了位置を変更してスクロール速度を調整
            pin: true, // ピン留め
            scrub: true, // スクロール量に応じて動かす
        }
    });
});




//===============================================================
// debounce関数
//===============================================================
function debounce(func, wait) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


//===============================================================
// メニュー関連
//===============================================================

// 変数でセレクタを管理
var $menubar = $('#menubar');
var $menubarHdr = $('#menubar_hdr');

// menu
$(window).on("load resize", debounce(function() {
    if(window.innerWidth < 900) {	// ここがブレイクポイント指定箇所です
        // 小さな端末用の処理
        $('body').addClass('small-screen').removeClass('large-screen');
        $menubar.addClass('display-none').removeClass('display-block');
        $menubarHdr.removeClass('display-none ham').addClass('display-block');
    } else {
        // 大きな端末用の処理
        $('body').addClass('large-screen').removeClass('small-screen');
        $menubar.addClass('display-block').removeClass('display-none');
        $menubarHdr.removeClass('display-block').addClass('display-none');

        // ドロップダウンメニューが開いていれば、それを閉じる
        $('.ddmenu_parent > ul').hide();
    }
}, 10));

$(function() {

    // ハンバーガーメニューをクリックした際の処理
    $menubarHdr.click(function() {
        $(this).toggleClass('ham');
        if ($(this).hasClass('ham')) {
            $menubar.addClass('display-block');
        } else {
            $menubar.removeClass('display-block');
        }
    });

    // アンカーリンクの場合にメニューを閉じる処理
    $menubar.find('a[href*="#"]').click(function() {
        $menubar.removeClass('display-block');
        $menubarHdr.removeClass('ham');
    });

    // ドロップダウンの親liタグ（空のリンクを持つaタグのデフォルト動作を防止）
	$menubar.find('a[href=""]').click(function() {
		return false;
	});

	// ドロップダウンメニューの処理
    $menubar.find('li:has(ul)').addClass('ddmenu_parent');
    $('.ddmenu_parent > a').addClass('ddmenu');

// タッチ開始位置を格納する変数
var touchStartY = 0;

// タッチデバイス用
$('.ddmenu').on('touchstart', function(e) {
    // タッチ開始位置を記録
    touchStartY = e.originalEvent.touches[0].clientY;
}).on('touchend', function(e) {
    // タッチ終了時の位置を取得
    var touchEndY = e.originalEvent.changedTouches[0].clientY;
    
    // タッチ開始位置とタッチ終了位置の差分を計算
    var touchDifference = touchStartY - touchEndY;
    
    // スクロール動作でない（差分が小さい）場合にのみドロップダウンを制御
    if (Math.abs(touchDifference) < 10) { // 10px以下の移動ならタップとみなす
        var $nextUl = $(this).next('ul');
        if ($nextUl.is(':visible')) {
            $nextUl.stop().hide();
        } else {
            $nextUl.stop().show();
        }
        $('.ddmenu').not(this).next('ul').hide();
        return false; // ドロップダウンのリンクがフォローされるのを防ぐ
    }
});

    //PC用
    $('.ddmenu_parent').hover(function() {
        $(this).children('ul').stop().show();
    }, function() {
        $(this).children('ul').stop().hide();
    });

    // ドロップダウンをページ内リンクで使った場合に、ドロップダウンを閉じる
    $('.ddmenu_parent ul a').click(function() {
        $('.ddmenu_parent > ul').hide();
    });

});


//===============================================================
// 小さなメニューが開いている際のみ、body要素のスクロールを禁止。
//===============================================================
$(function() {
    function toggleBodyScroll() {
        // 条件をチェック
        if ($('#menubar_hdr').hasClass('ham') && !$('#menubar_hdr').hasClass('display-none')) {
        // #menubar_hdr が 'ham' クラスを持ち、かつ 'display-none' クラスを持たない場合、スクロールを禁止
        $('body').css({
            overflow: 'hidden',
            height: '100%'
        });
        } else {
        // その他の場合、スクロールを再び可能に
        $('body').css({
            overflow: '',
            height: ''
        });
        }
    }

    // 初期ロード時にチェックを実行
    toggleBodyScroll();

    // クラスが動的に変更されることを想定して、MutationObserverを使用
    const observer = new MutationObserver(toggleBodyScroll);
    observer.observe(document.getElementById('menubar_hdr'), { attributes: true, attributeFilter: ['class'] });
});


//===============================================================
// スムーススクロール（※バージョン2024-1）※#menubarの高さを取得する場合
//===============================================================
$(function() {
    var menubarHeight = $('#menubar').outerHeight(); // #menubarの高さを取得

    // ページ上部へ戻るボタンのセレクター
    var topButton = $('.pagetop');
    // ページトップボタン表示用のクラス名
    var scrollShow = 'pagetop-show';

    // スムーススクロールを実行する関数
    // targetにはスクロール先の要素のセレクターまたは'#'（ページトップ）を指定
    function smoothScroll(target) {
        // スクロール先の位置を計算（ページトップの場合は0、それ以外は要素の位置）
        var scrollTo = target === '#' ? 0 : $(target).offset().top - menubarHeight;
        // アニメーションでスムーススクロールを実行
        $('html, body').animate({scrollTop: scrollTo}, 500);
    }

    // ページ内リンクとページトップへ戻るボタンにクリックイベントを設定
    $('a[href^="#"], .pagetop').click(function(e) {
        e.preventDefault(); // デフォルトのアンカー動作をキャンセル
        var id = $(this).attr('href') || '#'; // クリックされた要素のhref属性を取得、なければ'#'
        smoothScroll(id); // スムーススクロールを実行
    });

    // スクロールに応じてページトップボタンの表示/非表示を切り替え
    $(topButton).hide(); // 初期状態ではボタンを隠す
    $(window).scroll(function() {
        if($(this).scrollTop() >= 300) { // スクロール位置が300pxを超えたら
            $(topButton).fadeIn().addClass(scrollShow); // ボタンを表示
        } else {
            $(topButton).fadeOut().removeClass(scrollShow); // それ以外では非表示
        }
    });

    // ページロード時にURLのハッシュが存在する場合の処理
    if(window.location.hash) {
        // ページの最上部に即時スクロールする
        $('html, body').scrollTop(0);
        // 少し遅延させてからスムーススクロールを実行
        setTimeout(function() {
            smoothScroll(window.location.hash);
        }, 10);
    }
});


//===============================================================
// 汎用開閉処理
//===============================================================
$(function() {
	$('.openclose-parts').next().hide();
	$('.openclose-parts').click(function() {
		$(this).next().slideToggle();
		$('.openclose-parts').not(this).next().slideUp();
	});
});


//===============================================================
// スライドショー
//===============================================================
$(function() {
	var slides = $('#mainimg .slide');
	var slideCount = slides.length;
	var currentIndex = 0;

	slides.eq(currentIndex).css('opacity', 1).addClass('active');

	setInterval(function() {
		var nextIndex = (currentIndex + 1) % slideCount;
		slides.eq(currentIndex).css('opacity', 0).removeClass('active');
		slides.eq(nextIndex).css('opacity', 1).addClass('active');
		currentIndex = nextIndex;
	}, 5000); // 5秒ごとにスライドを切り替える
});


//===============================================================
// メニューにfixedクラスを付与
//===============================================================
document.addEventListener("DOMContentLoaded", function() {
    const menubar = document.getElementById('menubar');
    const triggerPoint = document.getElementById('trigger-point');
    let fixedTimeout;

    const handleIntersection = debounce(function(entries) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                menubar.classList.add('fixed');
                fixedTimeout = setTimeout(() => {
                    menubar.classList.add('fixed2');
                }, 1500); // 1.5秒後にfixed2を追加
            } else {
                menubar.classList.remove('fixed');
                menubar.classList.remove('fixed2');
                clearTimeout(fixedTimeout); // タイマーをクリアしてfixed2の追加を防止
            }
        });
    }, 100); // 適宜待機時間を調整

    const observer = new IntersectionObserver(handleIntersection, {
        root: null,
        threshold: 0
    });

    observer.observe(triggerPoint);
});


// ハンバーガーメニュー関連------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {

    // ハンバーガーメニューの要素を取得（IDが'hamburger'の要素）
    const hamburger = document.getElementById('hamburger');
    
    // メニューリストの要素を取得（IDが'menu'の要素）
    const menu = document.getElementById('menu');
    
    // ハンバーガーメニュー内のspan要素を取得
    const spans = hamburger.getElementsByTagName('span');

    // ハンバーガーメニューがクリックされたときの処理
    hamburger.addEventListener('click', () => {
        // メニューリストに'active'クラスをトグル（追加または削除）
        menu.classList.toggle('active');
        
        // ハンバーガーメニューにも'active'クラスをトグル（追加または削除）
        hamburger.classList.toggle('active');
        
        // 'active'クラスが付いている場合、2本目のspanを非表示にする
        if (menu.classList.contains('active')) {
            spans[1].style.display = 'none'; // 2本目のspanを非表示にする
        } else {
            spans[1].style.display = 'block'; // 2本目のspanを再表示
        }
    });
});


