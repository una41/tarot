<template>
	<Transition name="fade">
		<div class="result" @click.stop>
			<div class="bg" @click="store.fnClose"></div>
			<div v-if="store.result !== null" class="r_wrap result_talk" ref="pdfContent">
				<!-- PDF 전용 헤더 (화면에는 안보임) -->
				<div class="pdf_only_header" style="display: none;">
					<p class="corp">{{ (store.userCorpName || '').trim() || 'Numerology Tarot' }}</p>
					<p class="txt_sm">수비학으로 보는 나의운명</p>
					<h2>
						{{ clientName.trim() || '00' }}님 생일카드 해석 리포트
					</h2>
					<div class="sub_tit">
						{{ store.result }}번 - <span v-html="data.list[store.result].name"></span>
					</div>
				</div>
				<div class="r_top colb">
					<div class="c_left">
						<h3>생일카드 결과 <span>(톡상담)</span></h3>
					</div>
					<div class="c_right">
						<button class="btn_close" @click="store.fnClose"><span>닫기</span></button>
					</div>
					<div class="gnb">
						<button class="btn_copy" @click="openModal('copy')">📋복사</button>
						<!-- <button class="btn_pdf" @click="openModal('pdf')">💾PDF</button> -->
						<button class="link blue" @click="store.fnGo('reading')">🔗리딩</button>
						<button class="link" @click="store.fnGo('result')">🔗해석</button>
						<!-- <button v-if="store.isLeading" class="link talk" @click="store.fnGo('talk')">💬톡상담</button> -->
					</div>
				</div>
				<div class="r_cont">
					<h3 class="main_card_tit">
						{{ store.result }}번 - <div class="tit" v-html="data.list[store.result].name"></div>
					</h3>
					<!-- <section class="pdf_section1">
						<div class="col2">
							<div class="left">
								<div class="bx_img">
									<img :src="'/img/card/majors/' + store.result + '.jpg'" :alt="store.result + '번 ' + data.list[store.result].name" crossorigin="anonymous" />
								</div>
								<button v-if="['마스터', '프로'].includes(store.userGrade)" class="btn" @click="store.goToWiki(store.result, 'majors')">고유 설명 보기</button>
							</div>
							<div class="right">
								<dl class="info_birth mt0">
									<dt>생년월일</dt>
									<dd>{{ f_Birth }}</dd>
								</dl>
								<div class="lucky_group" v-if="data.list[store.result].lucky_group">
									<dl v-for="(val, key) in luckyMap" :key="key">
										<dt>행운의 {{ key }}</dt>
										<dd>{{ data.list[store.result].lucky_group[val] }}</dd>
									</dl>
								</div>
								<div class="summary_box" v-if="data.list[store.result].summary">
									<h5 class="sub_tit">{{ data.list[store.result].summary.sub_title }}</h5>
									<p class="cont" v-html="data.list[store.result].summary.cont"></p>
								</div>
								<div class="bx_key">
									<span class="tag" v-for="word in data.list[store.result].keyword" :key="word">{{ '#' + word +" "}}</span>
								</div>
							</div>
						</div>
						<div class="pdf_info">
							<h4 class="d_tit">🪄수비학 타로란?</h4>
							<div class="d_cont">
								숫자가 가진 유한 에너지의 성질과 타로의 상징을 결합하여 인생의 흐름을 논리적이고 체계적으로 분석합니다. <br/>
								생년월일을 계산해 타고난 기질과 운명적 주기를 파악하며, 삶의 목적을 더욱 선명하게 드러냅니다. <br/>
								단순한 우연을 넘어 수(數)의 질서 속에 숨겨진 명확한 삶의 이정표를 제시하는 현대적인 분석 기법입니다.
							</div>
						</div>
					</section> -->
					<div class="detail">
						<template v-for="section in talkSections" :key="section.key">
							<div class="item" v-if="activeSections.has(section.key) && !hiddenSections.has(section.key)">
								<input class="talk_title" v-model="editTitle[section.key]" :readonly="!editMode[section.key]" :class="{ editing: editMode[section.key] }" />
								<textarea class="talk_textarea" v-model="editData[section.key]" :readonly="!editMode[section.key]" :class="{ editing: editMode[section.key] }" @input="autoResize" placeholder="내용을 입력하세요"></textarea>
								<div class="talk_btns">
									<button v-if="editMode[section.key]" class="btn_cancel_item" @click="cancelEdit(section.key)">↩️취소</button>
									<button class="btn_edit_item" @click="toggleEdit(section.key)">{{ editMode[section.key] ? '✅완료' : '✏️수정' }}</button>
									<button class="btn_delete_item" @click="deleteItem(section.key)">🗑️삭제</button>
									<button class="btn_copy_item" @click="copyItem(section.key)">📋복사</button>
								</div>
							</div>
						</template>
						<template v-for="item in customSections" :key="'custom-' + item.id">
							<div class="item">
								<input class="talk_title" v-model="item.title" :readonly="!item.editing" :class="{ editing: item.editing }" />
								<textarea class="talk_textarea" v-model="item.content" :readonly="!item.editing" :class="{ editing: item.editing }" @input="autoResize" placeholder="내용을 입력하세요"></textarea>
								<div class="talk_btns">
									<button v-if="item.editing" class="btn_cancel_item" @click="cancelCustomEdit(item)">↩️취소</button>
									<button class="btn_edit_item" @click="toggleCustomEdit(item)">{{ item.editing ? '✅완료' : '✏️수정' }}</button>
									<button class="btn_delete_item" @click="deleteCustom(item.id)">🗑️삭제</button>
									<button class="btn_copy_item" @click="copyCustom(item)">📋복사</button>
								</div>
							</div>
						</template>
						<!-- 섹션 추가 버튼 영역 -->
						<div class="add_section_area" v-if="availableSections.length > 0">
							<p class="add_label">항목 추가</p>
							<div class="add_btns">
								<button v-for="s in availableSections" :key="s.key" class="btn_add_section" @click="addTalkSection(s.key)">+ {{ s.label }}</button>
							</div>
						</div>
						<button class="btn_add_item" @click="addSection">+ 커스텀 항목 추가</button>
					</div>
				</div>
			</div>
		</div>
	</Transition>

	<!-- 복사/PDF 모달 -->
	<CopyPdfModal v-model:show="showCopyModal" :mode="modalMode" :sections="copySections" @confirm="handleModalConfirm" />
</template>

<script setup>
	import { ref, reactive, computed, nextTick, watch } from 'vue';
	import { useTarotStore } from '~/stores/tarot';

	const store = useTarotStore();
	const props = defineProps(['data']);
	const clientName = ref('');
	const headerColor = ref('#fbdf70');

	const birth = store.picked === 'r1' ? store.ipt_birth8 : store.ipt_year + store.ipt_birth4;
	const f_Birth = birth.replace(/(\d{4})(\d{2})(\d{2})/, '$1년 $2월 $3일');

	const card = computed(() => props.data?.list?.[store.result]);

	const luckyMap = {
		'컬러': 'color',
		'숫자': 'number',
		'요일': 'day'
	};

	// 톡상담 섹션 정의
	const talkSections = [
		{ key: 'total', label: '내 삶의 전반적 흐름' },
		{ key: 'character', label: '타고난 성격' },
		{ key: 'health', label: '건강과 에너지' },
		{ key: 'wealth', label: '재물 관리' },
		{ key: 'study', label: '학업 및 자기개발' },
		{ key: 'career', label: '직업과 사회적 성공' },
		{ key: 'love', label: '사랑과 인연' },
		{ key: 'lucky_match', label: '최고의 파트너' },
		{ key: 'caution_match', label: '주의해야 할 인연' },
		{ key: 'life_lesson', label: '당신을 위한 조언' },
		{ key: 'advice', label: '운명의 가이드' },
	];

	const editData = reactive({});
	const editTitle = reactive({});
	const editMode = reactive({});
	const originalData = reactive({});
	const hiddenSections = reactive(new Set());

	// 복사/PDF 모달
	const showCopyModal = ref(false);
	const modalMode = ref('copy'); // 'copy' | 'pdf'
	const copySections = reactive([
		{ key: 'basic', label: '기본 정보', checked: true },
		{ key: 'total', label: '내 삶의 전반적 흐름', checked: true },
		{ key: 'character', label: '타고난 성격', checked: true },
		{ key: 'health', label: '건강과 에너지', checked: true },
		{ key: 'wealth', label: '재물 관리', checked: true },
		{ key: 'study', label: '학업 및 자기개발', checked: true },
		{ key: 'career', label: '직업과 사회적 성공', checked: true },
		{ key: 'love_solo', label: '사랑과 인연 - 솔로', checked: true, group: 'love' },
		{ key: 'love_couple', label: '사랑과 인연 - 커플', checked: true, group: 'love' },
		{ key: 'love_married', label: '사랑과 인연 - 결혼', checked: true, group: 'love' },
		{ key: 'lucky_match', label: '최고의 파트너', checked: true },
		{ key: 'caution_match', label: '주의해야 할 인연', checked: true },
		{ key: 'life_lesson', label: '당신을 위한 조언', checked: true },
		{ key: 'advice', label: '운명의 가이드', checked: true },
	]);

	const openModal = (mode) => {
		copySections.forEach(s => s.checked = true);
		modalMode.value = mode;
		showCopyModal.value = true;
	};

	const stripHtml = (html) => {
		if (!html) return '';
		const tmp = document.createElement('div');
		tmp.innerHTML = html;
		return tmp.textContent || '';
	};

	// 추가된 섹션 키 관리 (DB에 저장된 것 또는 사용자가 추가한 것만 표시)
	const activeSections = reactive(new Set());

	// 섹션 추가 함수
	const addTalkSection = (key) => {
		activeSections.add(key);
		if (!editData[key]) editData[key] = '';
		if (!editTitle[key]) editTitle[key] = talkSections.find(s => s.key === key)?.label || '';
		editMode[key] = true;
		originalData[key] = '';
	};

	// 아직 추가되지 않은 섹션 목록
	const availableSections = computed(() =>
		talkSections.filter(s => !activeSections.has(s.key) && !hiddenSections.has(s.key))
	);

	// 커스텀 항목
	const customSections = reactive([]);
	let customId = 0;

	// Firestore 저장/로드 - leading 문서에 talk_birth 필드로 저장
	const { $db } = useNuxtApp();
	let saveTimer = null;
	let leadingDocId = null;
	let createDate = null; // 최초 생성일 유지

	// 이메일로 leading 문서 ID 조회
	const getLeadingDocId = async () => {
		if (leadingDocId) return leadingDocId;
		if (!store.user?.email) return null;
		const { collection, query, where, getDocs } = await import('firebase/firestore');
		const q = query(collection($db, 'leading'), where('email', '==', store.user.email));
		const snapshot = await getDocs(q);
		if (snapshot.empty) return null;
		leadingDocId = snapshot.docs[0].id;
		return leadingDocId;
	};

	// activeSections + customSections → contents 배열로 변환
	const buildContents = () => {
		const contents = [];
		talkSections.forEach(s => {
			if (activeSections.has(s.key) && !hiddenSections.has(s.key)) {
				contents.push({
					tit: editTitle[s.key] || s.label,
					content: editData[s.key] || ''
				});
			}
		});
		customSections.forEach(item => {
			contents.push({
				tit: item.title || '',
				content: item.content || ''
			});
		});
		return contents;
	};

	const saveToFirestore = async () => {
		const docId = await getLeadingDocId();
		if (!docId) return;
		try {
			const { doc, getDoc, setDoc } = await import('firebase/firestore');
			const now = new Date();
			const cardKey = String(store.result);

			// 기존 talk_birth 맵 로드
			const snap = await getDoc(doc($db, 'leading', docId));
			let talkBirth = {};
			if (snap.exists() && snap.data().talk_birth) {
				talkBirth = snap.data().talk_birth;
			}

			// 기존 항목의 t_id, createDate 유지
			const existing = talkBirth[cardKey];
			talkBirth[cardKey] = {
				t_id: existing?.t_id ?? Object.keys(talkBirth).length,
				card_num: store.result,
				contents: buildContents(),
				createDate: createDate || now,
				modiDate: now
			};

			await setDoc(doc($db, 'leading', docId), {
				talk_birth: talkBirth
			}, { merge: true });
			if (!createDate) createDate = now;
		} catch (e) {
			console.error('톡상담 저장 실패:', e);
		}
	};

	const debouncedSave = () => {
		clearTimeout(saveTimer);
		saveTimer = setTimeout(saveToFirestore, 1000);
	};

	// talk_birth 맵에서 현재 카드 번호에 해당하는 항목 복원
	const loadFromFirestore = async () => {
		const docId = await getLeadingDocId();
		if (!docId) return;
		try {
			const { doc, getDoc } = await import('firebase/firestore');
			const snap = await getDoc(doc($db, 'leading', docId));
			if (!snap.exists()) return;
			const data = snap.data();
			if (!data.talk_birth) return;

			const saved = data.talk_birth[String(store.result)];
			if (!saved) return;

			createDate = saved.createDate?.toDate?.() || saved.createDate || null;

			if (saved.contents && Array.isArray(saved.contents)) {
				const labelToKey = {};
				talkSections.forEach(s => { labelToKey[s.label] = s.key; });

				saved.contents.forEach(item => {
					const key = labelToKey[item.tit];
					if (key) {
						activeSections.add(key);
						editData[key] = item.content || '';
						editTitle[key] = item.tit;
						editMode[key] = false;
						originalData[key] = item.content || '';
					} else {
						customSections.push({
							id: ++customId,
							title: item.tit || '',
							content: item.content || '',
							editing: false
						});
					}
				});
			}
		} catch (e) {
			console.error('톡상담 로드 실패:', e);
		}
	};

	loadFromFirestore();

	watch([editData, editTitle, customSections], debouncedSave, { deep: true });

	// textarea 자동 높이 조절
	const autoResize = (e) => {
		const el = e.target;
		el.style.height = 'auto';
		el.style.height = el.scrollHeight + 'px';
	};

	nextTick(() => {
		document.querySelectorAll('.result_talk .talk_textarea').forEach(el => {
			el.style.height = 'auto';
			el.style.height = el.scrollHeight + 'px';
		});
	});

	// 항목별 복사
	const copyItem = async (key) => {
		const title = editTitle[key] || talkSections.find(s => s.key === key).label;
		const text = `[${title}]\n${editData[key]}`;
		try {
			await navigator.clipboard.writeText(text);
			alert('복사되었습니다.');
		} catch (e) {
			console.error('복사 실패:', e);
			alert('복사에 실패했습니다.');
		}
	};

	// 항목별 수정 토글
	const toggleEdit = (key) => {
		if (!editMode[key]) {
			originalData[key] = editData[key];
		} else {
			// 완료 시 저장
			debouncedSave();
		}
		editMode[key] = !editMode[key];
	};

	// 항목별 수정 취소
	const cancelEdit = (key) => {
		editData[key] = originalData[key];
		editMode[key] = false;
		// 원본 데이터가 비어있으면 아직 저장 전이므로 섹션 제거
		if (!originalData[key]) {
			activeSections.delete(key);
			delete editData[key];
			delete editTitle[key];
		}
	};

	// 항목 삭제
	const deleteItem = (key) => {
		activeSections.delete(key);
		hiddenSections.add(key);
		debouncedSave();
	};

	const addSection = () => {
		customSections.push({
			id: ++customId,
			title: '새 항목',
			content: '',
			editing: true
		});
	};

	const copyCustom = async (item) => {
		const text = `[${item.title}]\n${item.content}`;
		try {
			await navigator.clipboard.writeText(text);
			alert('복사되었습니다.');
		} catch (e) {
			alert('복사에 실패했습니다.');
		}
	};

	const toggleCustomEdit = (item) => {
		if (!item.editing) {
			item._backupTitle = item.title;
			item._backupContent = item.content;
		}
		item.editing = !item.editing;
		debouncedSave();
	};

	const cancelCustomEdit = (item) => {
		// 백업이 없으면 새로 추가한 항목이므로 삭제
		if (item._backupTitle == null) {
			deleteCustom(item.id);
			return;
		}
		item.title = item._backupTitle;
		item.content = item._backupContent;
		item.editing = false;
	};

	const deleteCustom = (id) => {
		const idx = customSections.findIndex(s => s.id === id);
		if (idx !== -1) customSections.splice(idx, 1);
	};

	const doCopy = async () => {
		const card = props.data.list[store.result];
		const lines = [];
		const checked = (key) => copySections.find(s => s.key === key)?.checked;

		for (const section of copySections) {
			if (!section.checked || section.group) continue;

			if (section.key === 'basic') {
				lines.push(`[${store.result}번 - ${stripHtml(card.name)}]`);
				lines.push(`생년월일: ${f_Birth}`);
				if (card.lucky_group) {
					lines.push(`행운의 컬러: ${card.lucky_group.color}`);
					lines.push(`행운의 숫자: ${card.lucky_group.number}`);
					lines.push(`행운의 요일: ${card.lucky_group.day}`);
				}
				if (card.keyword) lines.push(`키워드: ${card.keyword.map(w => '#' + w).join(' ')}`);
				if (card.summary) {
					if (card.summary.sub_title) lines.push(card.summary.sub_title);
					if (card.summary.cont) lines.push(stripHtml(card.summary.cont));
				}
				lines.push('');
				continue;
			}

			if (!card[section.key]) continue;

			lines.push(`[${section.label}]`);
			const val = card[section.key];
			if (val.sub_title) lines.push(val.sub_title);
			if (val.cont) lines.push(stripHtml(val.cont));

			// 소울카드
			if (section.key === 'total' && card.soul?.cont) {
				lines.push(`\n소울카드 - ${card.soul.card}`);
				lines.push(stripHtml(card.soul.cont));
			}
			// 경매 및 투자운
			if (section.key === 'wealth' && card.rich?.cont) {
				lines.push(`\n경매 및 투자운`);
				lines.push(stripHtml(card.rich.cont));
			}
			// 추천직업
			if (section.key === 'career' && val.recommend) {
				lines.push(`추천직업: ${val.recommend.join(', ')}`);
			}
			lines.push('');
		}

		// 사랑과 인연 - 하위 항목 중 하나라도 체크되면 기본 내용 포함
		const loveAny = checked('love_solo') || checked('love_couple') || checked('love_married');
		if (loveAny && card.love) {
			lines.push(`[사랑과 인연]`);
			if (card.love.sub_title) lines.push(card.love.sub_title);
			if (card.love.cont) lines.push(stripHtml(card.love.cont));
			if (checked('love_solo') && card.love.solo) lines.push(`\n솔로: ${stripHtml(card.love.solo)}`);
			if (checked('love_couple') && card.love.couple) lines.push(`\n커플: ${stripHtml(card.love.couple)}`);
			if (checked('love_married') && card.love.married) lines.push(`\n결혼: ${stripHtml(card.love.married)}`);
			lines.push('');
		}

		try {
			await navigator.clipboard.writeText(lines.join('\n'));
			showCopyModal.value = false;
			alert('선택한 항목이 복사되었습니다.');
		} catch (e) {
			console.error('복사 실패:', e);
			alert('복사에 실패했습니다.');
		}
	};

	const handleModalConfirm = ({ clientName: name, headerColor: color }) => {
		clientName.value = name;
		headerColor.value = color;
		showCopyModal.value = false;
		if (modalMode.value === 'copy') doCopy();
		else downloadPDFWithSelection();
	};

	// PDF 관련 - 동적 import로 초기 로딩 최적화
	const pdfContent = ref(null);

	const titleToKey = {
		'내 삶의 전반적 흐름': 'total',
		'타고난 성격': 'character',
		'건강과 에너지': 'health',
		'재물 관리': 'wealth',
		'학업 및 자기개발': 'study',
		'직업과 사회적 성공': 'career',
		'사랑과 인연': 'love',
		'최고의 파트너': 'lucky_match',
		'주의해야 할 인연': 'caution_match',
		'당신을 위한 조언': 'life_lesson',
		'운명의 가이드': 'advice',
	};

	const downloadPDFWithSelection = async () => {
		if (!pdfContent.value) return;
		showCopyModal.value = false;

		const checked = (key) => copySections.find(s => s.key === key)?.checked;
		const el = pdfContent.value;
		const hiddenEls = [];

		// basic (pdf_section1) 숨김 처리
		if (!checked('basic')) {
			const s1 = el.querySelector('.pdf_section1');
			if (s1) { s1.style.display = 'none'; hiddenEls.push(s1); }
		}

		// 각 .item 요소를 타이틀로 매칭하여 숨김
		el.querySelectorAll('.detail .item').forEach(item => {
			const tit = item.querySelector('.d_tit');
			if (!tit) return;
			const key = titleToKey[tit.textContent.trim()];
			if (!key) return;

			if (key === 'love') {
				const loveAny = checked('love_solo') || checked('love_couple') || checked('love_married');
				if (!loveAny) {
					item.style.display = 'none';
					hiddenEls.push(item);
				} else {
					// 솔로/커플/결혼 개별 숨김
					item.querySelectorAll('.love_item').forEach(li => {
						const subTit = li.querySelector('.sub_tit')?.textContent || '';
						if (subTit.includes('솔로') && !checked('love_solo')) { li.style.display = 'none'; hiddenEls.push(li); }
						if (subTit.includes('커플') && !checked('love_couple')) { li.style.display = 'none'; hiddenEls.push(li); }
						if (subTit.includes('결혼') && !checked('love_married')) { li.style.display = 'none'; hiddenEls.push(li); }
					});
				}
			} else if (!checked(key)) {
				item.style.display = 'none';
				hiddenEls.push(item);
			}
		});

		// CSS 변수 설정 (워터마크, 헤더 색상)
		const corpName = (store.userCorpName || '').trim();
		if (corpName) {
			el.style.setProperty('--watermark-text', `"${corpName}"`);
		}
		el.style.setProperty('--pdf-header-color', headerColor.value);

		// PDF 라이브러리를 필요할 때만 로드
		const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
			import('html2canvas'),
			import('jspdf')
		]);

		await store.downloadPDF({
			pdfContent: el,
			html2canvas,
			jsPDF,
			filename: `타로_결과_리포트_${f_Birth}.pdf`
		});

		// CSS 변수 제거
		el.style.removeProperty('--watermark-text');
		el.style.removeProperty('--pdf-header-color');
		// 숨김 복원
		hiddenEls.forEach(e => e.style.display = '');
	};
</script>
