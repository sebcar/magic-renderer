const magicRenderer = (prefix) => {
    const render = (data) => {
        for (const prop in data){
            const $targets = document.querySelectorAll(prop);
            if ($targets.length > 0) {
                $targets.forEach($target => $target.innerHTML = data[prop]);
            }
        }
        magicRenderer(prefix);
    }
    (() => {
        async function getEvent(ev) {
            ev.preventDefault();
            const url =  ev.target.getAttribute('href');
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                render(data);
            }
        }
        async function formEvent(ev) {
            ev.preventDefault();
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
            const response = await fetch(url, fetchOptions);
            if (response.ok) {
                const data = await response.json();
                render(data);
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
