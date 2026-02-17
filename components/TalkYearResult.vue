<template>
	<Transition name="fade">
		<div class="result result_talk result_year" @click.stop>
			<div class="bg" @click="store.fnClose"></div>
			<div v-if="store.result !== null" class="r_wrap">
				<div class="r_top colb">
					<div class="c_left">
						<h3>{{ store.ipt_year + '년 해운카드' }} <b class="pc">결과</b> <span>(톡상담)</span></h3>
					</div>
					<div class="c_right">
						<button class="btn_close" @click="store.fnClose"><span>닫기</span></button>
					</div>
					<div class="gnb">
						<button class="btn_copy" @click="doCopy">📋복사</button>
						<button class="link" @click="store.fnGo('result')">🔗해석</button>
					</div>
				</div>
				<div class="r_cont">
					<h3 class="main_card_tit">
						{{ store.result }}번 - <div class="tit" v-html="data.list[store.result].name"></div>
					</h3>
					<div class="talk_card">
						<div class="bx_img">
							<img :src="'/img/card/majors/' + store.result + '.jpg'" :alt="store.result + '번 ' + data.list[store.result].name" />
						</div>
						<div class="r_colb" v-if="data.list[store.result].lucky_group">
							<dl class="info_birth mt0">
								<dt>해운년도</dt>
								<dd>{{ store.ipt_year }}</dd>
							</dl>
							<dl class="mt0">
								<dt>운</dt>
								<dd><span :class="'txt_bg ' + data.list[store.result].lucky_group.grade">{{ data.list[store.result].lucky_group.grade }}</span></dd>
							</dl>
						</div>
						<div class="r_colb" v-if="data.list[store.result].lucky_group">
							<dl>
								<dt>생일</dt>
								<dd>{{ f_BirthMD }}</dd>
							</dl>
							<dl>
								<dt>좋은 분기</dt>
								<dd>{{ data.list[store.result].lucky_group.lucky_timing }}</dd>
							</dl>
						</div>
						<div class="summary_box hr" v-for="(val, key) in luckyMap" :key="key">
							<h5 class="sub_tit">{{ key }}</h5>
							<p class="cont" v-html="data.list[store.result].lucky_group[val]"></p>
						</div>
						<div class="summary_box" v-if="data.list[store.result].summary">
							<h5 class="sub_tit">{{ data.list[store.result].summary.sub_title }}</h5>
							<p class="cont" v-html="data.list[store.result].summary.cont"></p>
						</div>
						<div class="bx_key">
							<span class="tag" v-for="word in data.list[store.result].keywords" :key="word">{{ word + " " }}</span>
						</div>
					</div>
					<div class="detail">
						<template v-for="section in talkSections" :key="section.key">
							<div class="item" v-if="card[section.key] && !hiddenSections.has(section.key)">
								<input class="talk_title" v-model="editTitle[section.key]" :readonly="!editMode[section.key]" :class="{ editing: editMode[section.key] }" />
								<textarea class="talk_textarea" v-model="editData[section.key]" :readonly="!editMode[section.key]" :class="{ editing: editMode[section.key] }" @input="autoResize"></textarea>
								<div class="talk_btns">
									<button v-if="editMode[section.key]" class="btn_cancel_item" @click="cancelEdit(section.key)">↩️취소</button>
									<button class="btn_edit_item" @click="toggleEdit(section.key)">{{ editMode[section.key] ? '✅완료' : '✏️수정' }}</button>
									<button class="btn_copy_item" @click="copyItem(section.key)">📋복사</button>
									<button class="btn_delete_item" @click="deleteItem(section.key)">🗑️삭제</button>
								</div>
							</div>
						</template>
						<template v-for="item in customSections" :key="'custom-' + item.id">
							<div class="item">
								<input class="talk_title editing" v-model="item.title" />
								<textarea class="talk_textarea editing" v-model="item.content" @input="autoResize"></textarea>
								<div class="talk_btns">
									<button class="btn_copy_item" @click="copyCustom(item)">📋복사</button>
									<button class="btn_cancel_item" @click="deleteCustom(item.id)">↩️취소</button>
								</div>
							</div>
						</template>
						<button class="btn_add_item" @click="addSection">+ 항목 추가</button>
					</div>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script setup>
	import { reactive, computed, nextTick, watch } from 'vue';
	import { useTarotStore } from '~/stores/tarot';

	const store = useTarotStore();
	const props = defineProps(['data']);

	const birth = store.ipt_year + store.ipt_birth4;
	const f_Birth = birth.replace(/(\d{4})(\d{2})(\d{2})/, '$1년 $2월 $3일');
	const f_BirthMD = store.ipt_birth4.replace(/(\d{2})(\d{2})/, '$1월 $2일');

	const card = computed(() => props.data?.list?.[store.result]);

	const luckyMap = {
		'추천 할일': 'todo',
	};

	// 톡상담 섹션 정의
	const talkSections = [
		{ key: 'roadmap', label: '연간 로드맵' },
		{ key: 'total', label: '내 삶의 전반적 흐름' },
		{ key: 'wealth', label: '재물 흐름' },
		{ key: 'study', label: '학업 및 자기개발' },
		{ key: 'career', label: '직업과 사회적 성공' },
		{ key: 'health', label: '건강과 에너지' },
		{ key: 'love', label: '사랑과 인연' },
		{ key: 'advice', label: '당신을 위한 조언' },
		{ key: 'lucky_tips', label: '운명의 가이드' },
	];

	const editData = reactive({});
	const editTitle = reactive({});
	const editMode = reactive({});
	const originalData = reactive({});
	const hiddenSections = reactive(new Set());

	const stripHtml = (html) => {
		if (!html) return '';
		const tmp = document.createElement('div');
		tmp.innerHTML = html;
		return tmp.textContent || '';
	};

	// 톡상담 항목별 텍스트 생성
	const buildContent = (c, key) => {
		const val = c[key];
		if (!val) return '';
		const lines = [];

		if (key === 'roadmap') {
			if (val.intro) lines.push(stripHtml(val.intro));
			if (val.q1) lines.push(`1분기 (1~3월): ${stripHtml(val.q1)}`);
			if (val.q2) lines.push(`2분기 (4~6월): ${stripHtml(val.q2)}`);
			if (val.q3) lines.push(`3분기 (7~9월): ${stripHtml(val.q3)}`);
			if (val.q4) lines.push(`4분기 (10~12월): ${stripHtml(val.q4)}`);
			return lines.join('\n');
		}

		if (val.sub_title) lines.push(val.sub_title);
		if (val.cont) lines.push(stripHtml(val.cont));
		else if (typeof val === 'string') lines.push(stripHtml(val));

		if (key === 'total' && c.soul?.cont) {
			lines.push('');
			lines.push(`소울카드 - ${c.soul.card}`);
			lines.push(stripHtml(c.soul.cont));
		}
		if (key === 'love') {
			if (val.solo) { lines.push(''); lines.push(`솔로: ${stripHtml(val.solo)}`); }
			if (val.couple) { lines.push(''); lines.push(`커플: ${stripHtml(val.couple)}`); }
			if (val.married) { lines.push(''); lines.push(`결혼: ${stripHtml(val.married)}`); }
		}
		return lines.join('\n');
	};

	// 톡상담 항목 초기화
	if (card.value) {
		talkSections.forEach(s => {
			const content = buildContent(card.value, s.key);
			editData[s.key] = content;
			editTitle[s.key] = s.label;
			originalData[s.key] = content;
			editMode[s.key] = false;
		});
	}

	// Firestore 저장/로드
	const { $db } = useNuxtApp();
	const docId = `year_${store.result}_${store.ipt_year}`;
	let saveTimer = null;

	const saveToFirestore = async () => {
		if (!store.user?.uid) return;
		try {
			const { doc, setDoc } = await import('firebase/firestore');
			await setDoc(doc($db, 'leading', store.user.uid, 'talk_edits', docId), {
				editData: { ...editData },
				editTitle: { ...editTitle },
				hidden: [...hiddenSections],
				custom: customSections.map(s => ({ ...s })),
				updatedAt: new Date()
			});
		} catch (e) {
			console.error('톡상담 저장 실패:', e);
		}
	};

	const debouncedSave = () => {
		clearTimeout(saveTimer);
		saveTimer = setTimeout(saveToFirestore, 1000);
	};

	const loadFromFirestore = async () => {
		if (!store.user?.uid) return;
		try {
			const { doc, getDoc } = await import('firebase/firestore');
			const snap = await getDoc(doc($db, 'leading', store.user.uid, 'talk_edits', docId));
			if (!snap.exists()) return;
			const saved = snap.data();
			if (saved.editData) Object.assign(editData, saved.editData);
			if (saved.editTitle) Object.assign(editTitle, saved.editTitle);
			if (saved.hidden) saved.hidden.forEach(k => hiddenSections.add(k));
			if (saved.custom) {
				customSections.splice(0, customSections.length, ...saved.custom);
				customId = Math.max(0, ...saved.custom.map(s => s.id || 0));
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
		}
		editMode[key] = !editMode[key];
	};

	// 항목별 수정 취소
	const cancelEdit = (key) => {
		editData[key] = originalData[key];
		editMode[key] = false;
	};

	// 항목 삭제
	const deleteItem = (key) => {
		hiddenSections.add(key);
		debouncedSave();
	};

	// 커스텀 항목 추가
	const customSections = reactive([]);
	let customId = 0;

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

	const deleteCustom = (id) => {
		const idx = customSections.findIndex(s => s.id === id);
		if (idx !== -1) customSections.splice(idx, 1);
	};

	const doCopy = async () => {
		const card = props.data.list[store.result];
		const lines = [];

		lines.push(`[${store.result}번 - ${stripHtml(card.name)}]`);
		lines.push(`해운년도: ${store.ipt_year}`);
		lines.push(`생일: ${f_BirthMD}`);
		if (card.lucky_group) {
			if (card.lucky_group.grade) lines.push(`운: ${card.lucky_group.grade}`);
			if (card.lucky_group.lucky_timing) lines.push(`좋은 분기: ${card.lucky_group.lucky_timing}`);
			if (card.lucky_group.todo) lines.push(`추천 할일: ${stripHtml(card.lucky_group.todo)}`);
		}
		if (card.keywords) lines.push(`키워드: ${card.keywords.join(' ')}`);
		if (card.summary) {
			if (card.summary.sub_title) lines.push(card.summary.sub_title);
			if (card.summary.cont) lines.push(stripHtml(card.summary.cont));
		}
		lines.push('');

		const sections = [
			{ key: 'total', label: '내 삶의 전반적 흐름' },
			{ key: 'wealth', label: '재물 흐름' },
			{ key: 'study', label: '학업 및 자기개발' },
			{ key: 'career', label: '직업과 사회적 성공' },
			{ key: 'health', label: '건강과 에너지' },
			{ key: 'advice', label: '당신을 위한 조언' },
			{ key: 'lucky_tips', label: '운명의 가이드' },
		];

		// 로드맵
		if (card.roadmap) {
			lines.push(`[연간 로드맵]`);
			if (card.roadmap.intro) lines.push(stripHtml(card.roadmap.intro));
			if (card.roadmap.q1) lines.push(`1분기 (1~3월): ${stripHtml(card.roadmap.q1)}`);
			if (card.roadmap.q2) lines.push(`2분기 (4~6월): ${stripHtml(card.roadmap.q2)}`);
			if (card.roadmap.q3) lines.push(`3분기 (7~9월): ${stripHtml(card.roadmap.q3)}`);
			if (card.roadmap.q4) lines.push(`4분기 (10~12월): ${stripHtml(card.roadmap.q4)}`);
			lines.push('');
		}

		for (const section of sections) {
			if (!card[section.key]) continue;
			lines.push(`[${section.label}]`);
			const val = card[section.key];
			if (val.sub_title) lines.push(val.sub_title);
			if (val.cont) lines.push(stripHtml(val.cont));
			if (section.key === 'total' && card.soul?.cont) {
				lines.push(`\n소울카드 - ${card.soul.card}`);
				lines.push(stripHtml(card.soul.cont));
			}
			lines.push('');
		}

		if (card.love) {
			lines.push(`[사랑과 인연]`);
			if (card.love.sub_title) lines.push(card.love.sub_title);
			if (card.love.cont) lines.push(stripHtml(card.love.cont));
			if (card.love.solo) lines.push(`\n솔로: ${stripHtml(card.love.solo)}`);
			if (card.love.couple) lines.push(`\n커플: ${stripHtml(card.love.couple)}`);
			if (card.love.married) lines.push(`\n결혼: ${stripHtml(card.love.married)}`);
			lines.push('');
		}

		try {
			await navigator.clipboard.writeText(lines.join('\n'));
			alert('전체 내용이 복사되었습니다.');
		} catch (e) {
			console.error('복사 실패:', e);
			alert('복사에 실패했습니다.');
		}
	};
</script>
