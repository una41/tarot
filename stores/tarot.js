import { defineStore } from 'pinia'

export const useTarotStore = defineStore('tarot', {
	state: () => ({
		ipt_birth8: '',
		ipt_birth4: '',
		ipt_year: '',
		result: null,
		// y_result: null,
		calc: ['', '', ''],
		y_calc: ['', '', ''],
		picked: 'r1',
		radio: [
			{ text: '생일카드', id: 'r1' },
			{ text: '해운카드', id: 'r2' },
		]
	}),
	actions: {
        fnBirthCalc() {
            this.calc = ['', '', ''];
            if (/[^0-9]/.test(this.ipt_birth8)) {
                alert("숫자만 입력해주세요!");
                this.ipt_birth8 = "";
                return;
            }
            if (this.ipt_birth8.length !== 8) {
                alert('생년월일 8자리를 정확히 입력해주세요 (예: 19900219)');
                return;
            }
            const digits = this.ipt_birth8.split('');
            let sum = digits.reduce((acc, curr) => acc + Number(curr), 0);
            this.calc[0] = digits.join(' + ');
            if (sum > 21) {
                this.calc[1] = sum;
                const temp = sum.toString().split('');
                sum = temp.reduce((acc, curr) => acc + Number(curr), 0);
                this.calc[2] = temp.join(' + ');
            }
            this.result = sum;
        },

        fnYearCalc() {
            this.calc = ['', '', ''];
            if (/[^0-9]/.test(this.ipt_year) || /[^0-9]/.test(this.ipt_birth4)) {
                alert("숫자만 입력해주세요!");
                if (/[^0-9]/.test(this.ipt_year)) this.ipt_year = "";
                if (/[^0-9]/.test(this.ipt_birth4)) this.ipt_birth4 = "";
                return;
            }
            if (this.ipt_year.length !== 4) {
                alert('연도 4자리를 정확히 입력해주세요 (예: 1999)');
                this.ipt_year = "";
                return;
            }
            if (this.ipt_birth4.length !== 4) {
                alert('생일 4자리를 정확히 입력해주세요 (예: 0130)');
                this.ipt_birth4 = "";
                return;
            }
            const tempStr = this.ipt_year + "" + this.ipt_birth4;
            const digits = tempStr.split('');
            let sum = digits.reduce((acc, curr) => acc + Number(curr), 0);
            this.y_calc[0] = digits.join(' + ');
            if (sum > 21) {
                this.y_calc[1] = sum;
                const temp = sum.toString().split('');
                sum = temp.reduce((acc, curr) => acc + Number(curr), 0);
                this.y_calc[2] = temp.join(' + ');
				if(sum == 22) sum = 0;
            }
            // this.y_result = sum;
            this.result = sum;
        },

        fnReset() {
            this.ipt_birth8 = '';
            this.ipt_birth4 = '';
            this.ipt_year = '';
            this.result = null;
            // this.y_result = null;
            this.calc = ['', '', ''];
            this.y_calc = ['', '', ''];
        },

        fnClose() {
            this.fnReset();
        }
	}
})