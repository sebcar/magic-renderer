const magicRenderer = (prefix) => {
    const runAfterResponse = (prefix, $el) => {
        if (!$el.hasAttribute(`${prefix}-after`)) {
            return false;
        }

        const eventName = $el.getAttribute(`${prefix}-after`);
        const customEvent = new CustomEvent(eventName);
        window.dispatchEvent(customEvent);
    };

    const render = (data, $el) => {

        for (const prop in data){
            const $targets = document.querySelectorAll(prop);
            if ($targets.length > 0) {
                for (const $target of $targets) {
                    $target.innerHTML = data[prop]; 
                    console.log(data[prop]);
                }
            }
        }

        runAfterResponse(prefix, $el);

        magicRenderer(prefix);
    }

    (() => {

        async function getEvent(ev) {
            ev.preventDefault();
            const url =  ev.target.getAttribute('href');
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                render(data, ev.target);
            }
        }

        async function formEvent(ev) {
            ev.preventDefault();
            if (ev.target.isSending) {
                return false;
            }

            ev.target.isSending = true;
            let $loading = null;
            if (ev.target.hasAttribute(`${prefix}-loading`)){
                $loading = document.querySelector(ev.target.getAttribute(`${prefix}-loading`));
            }

            const fetchOptions = {
                method: ev.target.method,
            }
            let url = ev.target.action;
            const formData = new FormData(ev.target);

            if (ev.target.method.toUpperCase() === 'POST') {
                fetchOptions['body'] = formData;
            } else {
                url += '?' + new URLSearchParams(formData).toString();
            }

            if ($loading) {
                ev.target.innerHTML = $loading.innerHTML;
            }

            const response = await fetch(url, fetchOptions);
            ev.target.isSending = false;
            if (response.ok) {
                const data = await response.json();
                render(data, ev.target);
            }
        }
        const $elems = document.querySelectorAll(`a[${prefix}], button[${prefix}], form[${prefix}]`);
        if ($elems.length === 0) {
            return false;
        }
        $elems.forEach($el => {

            if (!$el.hasMrEvent) {

                $el.hasMrEvent = true;
                if ($el instanceof HTMLFormElement) {
                    $el.addEventListener('submit', formEvent);
                } else {
                    $el.addEventListener('click', getEvent);
                }

            }
        })
    })();
}

export default magicRenderer;
