<template>
	<div class="mypage">
		<div class="my_profile">
			<div class="avatar">
				<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#6b5a3e" viewBox="0 0 16 16">
					<path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
				</svg>
			</div>
			<p class="my_name">{{ userData.name || '-' }}</p>
			<span class="my_badge" :class="gradeClass">{{ store.userGrade || '일반' }}</span>
		</div>

		<div class="my_info_card">
			<!-- 이메일 (수정 불가) -->
			<dl class="my_info_item">
				<dt>
					<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="#8b7355" viewBox="0 0 16 16">
						<path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z"/>
					</svg>
					<span>이메일</span>
				</dt>
				<dd>{{ userData.email || '-' }}</dd>
			</dl>
			<!-- 기수 (수정 불가) -->
			<dl class="my_info_item">
				<dt>
					<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="#8b7355" viewBox="0 0 16 16">
						<path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2zm3.564 1.426L5.596 5 8 5.961 14.154 3.5zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464z"/>
					</svg>
					<span>기수</span>
				</dt>
				<dd>{{ userData.class || '-' }}</dd>
			</dl>
			<!-- 상호명 -->
			<dl class="my_info_item">
				<dt>
					<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="#8b7355" viewBox="0 0 16 16">
						<path d="M4 16s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-5.95a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
						<path d="M2 1a2 2 0 0 0-2 2v9.5A1.5 1.5 0 0 0 1.5 14h.653a5.4 5.4 0 0 1 1.066-2H1V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v9h-2.219c.554.654.89 1.373 1.066 2h.653A1.5 1.5 0 0 0 16 12.5V3a2 2 0 0 0-2-2z"/>
					</svg>
					<span>상호명</span>
				</dt>
				<dd v-if="!isEditing">{{ userData.corpName || '-' }}</dd>
				<dd v-else><input v-model="editForm.corpName" type="text" class="ipt_edit" placeholder="상호명 입력" /></dd>
			</dl>
			<!-- 전화번호 -->
			<dl class="my_info_item">
				<dt>
					<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="#8b7355" viewBox="0 0 16 16">
						<path fill-rule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z"/>
					</svg>
					<span>전화번호</span>
				</dt>
				<dd v-if="!isEditing">{{ encodedPhone }}</dd>
				<dd v-else>
					<input v-model="editForm.phone" type="tel" class="ipt_edit" placeholder="010-0000-0000" maxlength="13" @input="onPhoneInput" />
					<p v-if="phoneError" class="txt_error">{{ phoneError }}</p>
				</dd>
			</dl>

			<div v-if="!isEditing">
				<button class="btn_edit" @click="fnStartEdit">
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#8b7355" viewBox="0 0 16 16">
						<path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
						<path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
					</svg>
					<span>회원정보 수정</span>
				</button>
			</div>
			<div v-else class="btn_edit_group">
				<button class="btn_cancel" @click="fnCancelEdit">취소</button>
				<button class="btn_save" @click="fnSaveEdit">저장</button>
			</div>
		</div>

		<button class="btn_logout" @click="fnLogout">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#c53030" viewBox="0 0 16 16">
				<path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
				<path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
			</svg>
			<span>로그아웃</span>
		</button>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useTarotStore } from '~/stores/tarot';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const store = useTarotStore();

const isEditing = ref(false);
const isSaving = ref(false);

const userData = ref({
	name: store.user?.name || '',
	email: store.user?.email || '',
	phone: '',
	corpName: '',
	class: '',
});

const editForm = ref({
	corpName: '',
	phone: '',
});

// Base64 디코딩 → 순수 숫자 전화번호
const decodePhone = (encoded) => {
	if (!encoded) return '';
	try {
		return atob(String(encoded));
	} catch {
		return String(encoded);
	}
};

// 하이픈 포함 전화번호 → Base64 인코딩
const encodePhone = (formatted) => {
	if (!formatted) return '';
	return btoa(formatted);
};

// 전화번호 마스킹 표시 (디코딩 후 010-****-4017 형태)
const encodedPhone = computed(() => {
	const decoded = decodePhone(userData.value.phone);
	if (!decoded) return '-';
	const clean = decoded.replace(/[^0-9]/g, '');
	if (!clean || clean.length < 8) return '-';
	if (clean.length === 11) {
		return `${clean.slice(0, 3)}-****-${clean.slice(7)}`;
	}
	if (clean.length === 10) {
		return `${clean.slice(0, 3)}-***-${clean.slice(6)}`;
	}
	return `${clean.slice(0, 3)}-${'*'.repeat(clean.length - 7)}-${clean.slice(-4)}`;
});

const phoneError = ref('');
const phonePattern = /^\d{3}-\d{3,4}-\d{4}$/;

// 전화번호 입력 시 숫자+하이픈만 허용
const onPhoneInput = (e) => {
	editForm.value.phone = e.target.value.replace(/[^0-9-]/g, '');
	if (editForm.value.phone && !phonePattern.test(editForm.value.phone)) {
		phoneError.value = '010-0000-0000 형식으로 입력해주세요';
	} else {
		phoneError.value = '';
	}
};

onMounted(async () => {
	if (store.user?.uid) {
		try {
			const { $db } = useNuxtApp();
			const userDoc = await getDoc(doc($db, 'users', store.user.uid));
			if (userDoc.exists()) {
				const data = userDoc.data();
				userData.value = {
					name: data.name || '',
					email: data.email || '',
					phone: data.phone || '',
					corpName: data.corpName || '',
					class: data.class || '',
				};
			}
		} catch (e) {
			console.error('사용자 정보 조회 실패:', e);
		}
	}
});

const gradeClass = computed(() => {
	const grade = store.userGrade;
	if (grade === '마스터') return 'master';
	if (grade === '프로') return 'pro';
	return 'normal';
});

const fnStartEdit = () => {
	editForm.value = {
		corpName: userData.value.corpName,
		phone: decodePhone(userData.value.phone),
	};
	phoneError.value = '';
	isEditing.value = true;
};

const fnCancelEdit = () => {
	isEditing.value = false;
};

const fnSaveEdit = async () => {
	if (isSaving.value) return;
	isSaving.value = true;

	try {
		const { $db } = useNuxtApp();
		const userRef = doc($db, 'users', store.user.uid);
		const phone = editForm.value.phone.trim();
		if (!phonePattern.test(phone)) {
			phoneError.value = '010-0000-0000 형식으로 입력해주세요';
			isSaving.value = false;
			return;
		}
		const encoded = encodePhone(phone);

		await updateDoc(userRef, {
			corpName: editForm.value.corpName,
			phone: encoded,
		});

		userData.value.corpName = editForm.value.corpName;
		userData.value.phone = encoded;

		isEditing.value = false;
		store.showAlert({
			message: '회원정보가 수정되었습니다.',
			icon: '✅'
		});
	} catch (e) {
		console.error('회원정보 수정 실패:', e);
		store.showAlert({
			message: '수정에 실패했습니다. 다시 시도해주세요.',
			icon: '❌'
		});
	} finally {
		isSaving.value = false;
	}
};

const fnLogout = () => {
	store.showConfirm({
		title: '로그아웃',
		message: '로그아웃 하시겠습니까?',
		icon: '👋',
		onConfirm: async () => {
			await store.fnLogout();
			navigateTo('/');
		}
	});
};
</script>

<style lang="scss" scoped>
.mypage {
	width: 100%;
	height: 100vh;
	background: #f5f0e8;
	padding: 30px 20px 20px;
	margin: 0 auto;

	.my_profile {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0 0 30px;

		.avatar {
			width: 60px;
			height: 60px;
			border-radius: 50%;
			background: #fbdf70;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-bottom: 13px;
		}

		.my_name {
			font-size: 18px;
			font-weight: 700;
			color: #2d2015;
			margin-bottom: 12px;
		}

		.my_badge {
			display: inline-block;
			padding: 4px 18px;
			border-radius: 20px;
			font-size: 12px;
			font-weight: 600;
			color: #fff;
			letter-spacing: 1px;

			&.normal {
				background: #6b7280;
			}
			&.pro {
				background: #7c3aed;
			}
			&.master {
				background: #5c4033;
			}
		}
	}

	.my_info_card {
		background: #fff;
		border-radius: 16px;
		padding: 22px 23px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

		.my_info_item {
			padding: 10px 0;
			border-bottom: 1px solid #e8e2d8;

			&:first-child {
				padding-top: 0;
			}
			&:last-of-type {
				border-bottom: none;
				padding-bottom: 15px;
			}

			dt {
				display: flex;
				align-items: center;
				gap: 10px;
				margin-bottom: 6px;

				span {
					font-size: 0.8rem;
					color: #999;
					font-weight: 400;
				}
			}

			dd {
				font-size: 15px;
				color: #2d2015;
				font-weight: 500;
				padding-left: 32px;

				.ipt_edit {
					width: 100%;
					padding: 8px 12px;
					border: 1.5px solid #c4b698;
					border-radius: 8px;
					font-size: 0.95rem;
					color: #2d2015;
					background: #faf8f4;
					outline: none;
					transition: border-color 200ms;

					&:focus {
						border-color: #8b7355;
					}

					&::placeholder {
						color: #c4b698;
					}
				}

				.txt_error {
					font-size: 0.75rem;
					color: #c53030;
					margin-top: 5px;
				}
			}
		}

		.btn_edit {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 8px;
			width: 100%;
			padding: 12px 0;
			border: 1.5px solid #c4b698;
			border-radius: 10px;
			background: transparent;
			cursor: pointer;
			transition: all 300ms;

			span {
				font-size: 0.95rem;
				color: #5c4a34;
				font-weight: 500;
			}

			&:hover {
				background: #faf6ee;
			}
			&:active {
				background: #f0eadd;
			}
		}

		.btn_edit_group {
			display: flex;
			gap: 10px;

			button {
				flex: 1;
				padding: 14px 0;
				border-radius: 10px;
				font-size: 0.95rem;
				font-weight: 500;
				cursor: pointer;
				transition: all 300ms;
			}

			.btn_cancel {
				border: 1.5px solid #d1ccc3;
				background: #fff;
				color: #888;

				&:hover {
					background: #f5f5f5;
				}
			}

			.btn_save {
				border: none;
				background: #5c4033;
				color: #fff;

				&:hover {
					background: #7a5a48;
				}
			}
		}
	}

	.btn_logout {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		padding: 12px 0;
		margin-top: 20px;
		border: 1.5px solid #e8bcbc;
		border-radius: 12px;
		background: #fff;
		cursor: pointer;
		transition: all 300ms;

		span {
			font-size: 1rem;
			color: #c53030;
			font-weight: 500;
		}

		&:hover {
			background: #fef2f2;
		}
		&:active {
			background: #fde8e8;
		}
	}
}
</style>
