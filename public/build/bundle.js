
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.49.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* src/Global.svelte generated by Svelte v3.49.0 */

    const fileFormats = ["CSV", "JSON"];
    const locations = ["Red Near", "Red Mid", "Red Far", "Blue Near", "Blue Mid", "Blue Far"];

    const ms = writable({
    	location: "Red Near",
    	team: "",
    	match: 1,
    	isAbsent: false,
    	template: null,
    	metrics: [],
    	menuVisible: false
    });

    const exampleTemplate = {
    	metrics: [
    		// { name: "Toggle", type: "toggle", group: "Group" },
    		// { name: "Number", type: "number" },
    		// { name: "Select", type: "select", values: ["Value 1", "Value 2", "Value 3"] },
    		// { name: "Text", type: "text", tip: "Tip" },
    		// { name: "Rating", type: "rating" },
    		// { name: "Timer", type: "timer" },
    		{
    			name: "Upper Scored",
    			type: "number",
    			group: "Auto"
    		},
    		{ name: "Lower Scored", type: "number" },
    		{ name: "Taxi", type: "toggle" },
    		{
    			name: "Upper Scored",
    			type: "number",
    			group: "Teleop"
    		},
    		{ name: "Lower Scored", type: "number" },
    		{
    			name: "Climb",
    			type: "select",
    			values: ["Not attempted", "Low", "Mid", "High", "Traversal", "Failed"],
    			group: "Endgame"
    		},
    		{
    			name: "Playstyle",
    			type: "select",
    			values: ["Unknown", "Offensive", "Defensive", "Mixed"],
    			group: "Misc"
    		},
    		{ name: "Driver Skill", type: "rating" },
    		{ name: "Swerve Drive", type: "toggle" },
    		{ name: "Comments", type: "paragraph" }
    	]
    };

    const metricDefaults = [
    	{ name: "toggle", default: false },
    	{ name: "number", default: 0 },
    	{ name: "select", default: 0 },
    	{ name: "text", default: "" },
    	{ name: "rating", default: 0 },
    	{ name: "timer", default: 0 }
    ];

    function getMetricDefaultValue(type) {
    	var _a;

    	return (_a = metricDefaults.find(t => t.name == type)) === null || _a === void 0
    	? void 0
    	: _a.default;
    }

    function getSurvey(data) {
    	return [
    		{ name: "Team", value: data.team },
    		{ name: "Match", value: data.match },
    		{ name: "Absent", value: data.isAbsent },
    		...data.metrics.map(metric => {
    			return { name: metric.name, value: metric.value };
    		})
    	];
    }

    function backupSurvey(data) {
    	localStorage.setItem("backup", JSON.stringify(getSurvey(data)));
    }

    const icons = [
    	{
    		name: "bars",
    		width: 448,
    		path: "M0 96C0 78.33 14.33 64 32 64H416C433.7 64 448 78.33 448 96C448 113.7 433.7 128 416 128H32C14.33 128 0 113.7 0 96zM0 256C0 238.3 14.33 224 32 224H416C433.7 224 448 238.3 448 256C448 273.7 433.7 288 416 288H32C14.33 288 0 273.7 0 256zM416 448H32C14.33 448 0 433.7 0 416C0 398.3 14.33 384 32 384H416C433.7 384 448 398.3 448 416C448 433.7 433.7 448 416 448z"
    	},
    	{
    		name: "copy",
    		width: 512,
    		path: "M384 96L384 0h-112c-26.51 0-48 21.49-48 48v288c0 26.51 21.49 48 48 48H464c26.51 0 48-21.49 48-48V128h-95.1C398.4 128 384 113.6 384 96zM416 0v96h96L416 0zM192 352V128h-144c-26.51 0-48 21.49-48 48v288c0 26.51 21.49 48 48 48h192c26.51 0 48-21.49 48-48L288 416h-32C220.7 416 192 387.3 192 352z"
    	},
    	{
    		name: "check",
    		width: 448,
    		path: "M384 32C419.3 32 448 60.65 448 96V416C448 451.3 419.3 480 384 480H64C28.65 480 0 451.3 0 416V96C0 60.65 28.65 32 64 32H384zM339.8 211.8C350.7 200.9 350.7 183.1 339.8 172.2C328.9 161.3 311.1 161.3 300.2 172.2L192 280.4L147.8 236.2C136.9 225.3 119.1 225.3 108.2 236.2C97.27 247.1 97.27 264.9 108.2 275.8L172.2 339.8C183.1 350.7 200.9 350.7 211.8 339.8L339.8 211.8z"
    	},
    	{
    		name: "download",
    		width: 512,
    		path: "M480 352h-133.5l-45.25 45.25C289.2 409.3 273.1 416 256 416s-33.16-6.656-45.25-18.75L165.5 352H32c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h448c17.67 0 32-14.33 32-32v-96C512 366.3 497.7 352 480 352zM432 456c-13.2 0-24-10.8-24-24c0-13.2 10.8-24 24-24s24 10.8 24 24C456 445.2 445.2 456 432 456zM233.4 374.6C239.6 380.9 247.8 384 256 384s16.38-3.125 22.62-9.375l128-128c12.49-12.5 12.49-32.75 0-45.25c-12.5-12.5-32.76-12.5-45.25 0L288 274.8V32c0-17.67-14.33-32-32-32C238.3 0 224 14.33 224 32v242.8L150.6 201.4c-12.49-12.5-32.75-12.5-45.25 0c-12.49 12.5-12.49 32.75 0 45.25L233.4 374.6z"
    	},
    	{
    		name: "erase",
    		width: 512,
    		path: "M480 416C497.7 416 512 430.3 512 448C512 465.7 497.7 480 480 480H150.6C133.7 480 117.4 473.3 105.4 461.3L25.37 381.3C.3786 356.3 .3786 315.7 25.37 290.7L258.7 57.37C283.7 32.38 324.3 32.38 349.3 57.37L486.6 194.7C511.6 219.7 511.6 260.3 486.6 285.3L355.9 416H480zM265.4 416L332.7 348.7L195.3 211.3L70.63 336L150.6 416L265.4 416z"
    	},
    	{
    		name: "minus",
    		width: 448,
    		path: "M400 288h-352c-17.69 0-32-14.32-32-32.01s14.31-31.99 32-31.99h352c17.69 0 32 14.3 32 31.99S417.7 288 400 288z"
    	},
    	{
    		name: "nocheck",
    		width: 448,
    		path: "M384 32C419.3 32 448 60.65 448 96V416C448 451.3 419.3 480 384 480H64C28.65 480 0 451.3 0 416V96C0 60.65 28.65 32 64 32H384zM384 80H64C55.16 80 48 87.16 48 96V416C48 424.8 55.16 432 64 432H384C392.8 432 400 424.8 400 416V96C400 87.16 392.8 80 384 80z"
    	},
    	{
    		name: "nostar",
    		width: 576,
    		path: "M287.9 0C297.1 0 305.5 5.25 309.5 13.52L378.1 154.8L531.4 177.5C540.4 178.8 547.8 185.1 550.7 193.7C553.5 202.4 551.2 211.9 544.8 218.2L433.6 328.4L459.9 483.9C461.4 492.9 457.7 502.1 450.2 507.4C442.8 512.7 432.1 513.4 424.9 509.1L287.9 435.9L150.1 509.1C142.9 513.4 133.1 512.7 125.6 507.4C118.2 502.1 114.5 492.9 115.1 483.9L142.2 328.4L31.11 218.2C24.65 211.9 22.36 202.4 25.2 193.7C28.03 185.1 35.5 178.8 44.49 177.5L197.7 154.8L266.3 13.52C270.4 5.249 278.7 0 287.9 0L287.9 0zM287.9 78.95L235.4 187.2C231.9 194.3 225.1 199.3 217.3 200.5L98.98 217.9L184.9 303C190.4 308.5 192.9 316.4 191.6 324.1L171.4 443.7L276.6 387.5C283.7 383.7 292.2 383.7 299.2 387.5L404.4 443.7L384.2 324.1C382.9 316.4 385.5 308.5 391 303L476.9 217.9L358.6 200.5C350.7 199.3 343.9 194.3 340.5 187.2L287.9 78.95z"
    	},
    	{
    		name: "pause",
    		width: 384,
    		path: "M272 63.1l-32 0c-26.51 0-48 21.49-48 47.1v288c0 26.51 21.49 48 48 48L272 448c26.51 0 48-21.49 48-48v-288C320 85.49 298.5 63.1 272 63.1zM80 63.1l-32 0c-26.51 0-48 21.49-48 48v288C0 426.5 21.49 448 48 448l32 0c26.51 0 48-21.49 48-48v-288C128 85.49 106.5 63.1 80 63.1z"
    	},
    	{
    		name: "pen",
    		width: 512,
    		path: "M362.7 19.32C387.7-5.678 428.3-5.678 453.3 19.32L492.7 58.75C517.7 83.74 517.7 124.3 492.7 149.3L444.3 197.7L314.3 67.72L362.7 19.32zM421.7 220.3L188.5 453.4C178.1 463.8 165.2 471.5 151.1 475.6L30.77 511C22.35 513.5 13.24 511.2 7.03 504.1C.8198 498.8-1.502 489.7 .976 481.2L36.37 360.9C40.53 346.8 48.16 333.9 58.57 323.5L291.7 90.34L421.7 220.3z"
    	},
    	{
    		name: "play",
    		width: 384,
    		path: "M361 215C375.3 223.8 384 239.3 384 256C384 272.7 375.3 288.2 361 296.1L73.03 472.1C58.21 482 39.66 482.4 24.52 473.9C9.377 465.4 0 449.4 0 432V80C0 62.64 9.377 46.63 24.52 38.13C39.66 29.64 58.21 29.99 73.03 39.04L361 215z"
    	},
    	{
    		name: "plus",
    		width: 448,
    		path: "M432 256c0 17.69-14.33 32.01-32 32.01H256v144c0 17.69-14.33 31.99-32 31.99s-32-14.3-32-31.99v-144H48c-17.67 0-32-14.32-32-32.01s14.33-31.99 32-31.99H192v-144c0-17.69 14.33-32.01 32-32.01s32 14.32 32 32.01v144h144C417.7 224 432 238.3 432 256z"
    	},
    	{
    		name: "question",
    		width: 320,
    		path: "M204.3 32.01H96c-52.94 0-96 43.06-96 96c0 17.67 14.31 31.1 32 31.1s32-14.32 32-31.1c0-17.64 14.34-32 32-32h108.3C232.8 96.01 256 119.2 256 147.8c0 19.72-10.97 37.47-30.5 47.33L127.8 252.4C117.1 258.2 112 268.7 112 280v40c0 17.67 14.31 31.99 32 31.99s32-14.32 32-31.99V298.3L256 251.3c39.47-19.75 64-59.42 64-103.5C320 83.95 268.1 32.01 204.3 32.01zM144 400c-22.09 0-40 17.91-40 40s17.91 39.1 40 39.1s40-17.9 40-39.1S166.1 400 144 400z"
    	},
    	{
    		name: "reset",
    		width: 512,
    		path: "M480 256c0 123.4-100.5 223.9-223.9 223.9c-48.84 0-95.17-15.58-134.2-44.86c-14.12-10.59-16.97-30.66-6.375-44.81c10.59-14.12 30.62-16.94 44.81-6.375c27.84 20.91 61 31.94 95.88 31.94C344.3 415.8 416 344.1 416 256s-71.69-159.8-159.8-159.8c-37.46 0-73.09 13.49-101.3 36.64l45.12 45.14c17.01 17.02 4.955 46.1-19.1 46.1H35.17C24.58 224.1 16 215.5 16 204.9V59.04c0-24.04 29.07-36.08 46.07-19.07l47.6 47.63C149.9 52.71 201.5 32.11 256.1 32.11C379.5 32.11 480 132.6 480 256z"
    	},
    	{
    		name: "save",
    		width: 448,
    		path: "M433.1 129.1l-83.9-83.9C342.3 38.32 327.1 32 316.1 32H64C28.65 32 0 60.65 0 96v320c0 35.35 28.65 64 64 64h320c35.35 0 64-28.65 64-64V163.9C448 152.9 441.7 137.7 433.1 129.1zM224 416c-35.34 0-64-28.66-64-64s28.66-64 64-64s64 28.66 64 64S259.3 416 224 416zM320 208C320 216.8 312.8 224 304 224h-224C71.16 224 64 216.8 64 208v-96C64 103.2 71.16 96 80 96h224C312.8 96 320 103.2 320 112V208z"
    	},
    	{
    		name: "star",
    		width: 576,
    		path: "M381.2 150.3L524.9 171.5C536.8 173.2 546.8 181.6 550.6 193.1C554.4 204.7 551.3 217.3 542.7 225.9L438.5 328.1L463.1 474.7C465.1 486.7 460.2 498.9 450.2 506C440.3 513.1 427.2 514 416.5 508.3L288.1 439.8L159.8 508.3C149 514 135.9 513.1 126 506C116.1 498.9 111.1 486.7 113.2 474.7L137.8 328.1L33.58 225.9C24.97 217.3 21.91 204.7 25.69 193.1C29.46 181.6 39.43 173.2 51.42 171.5L195 150.3L259.4 17.97C264.7 6.954 275.9-.0391 288.1-.0391C300.4-.0391 311.6 6.954 316.9 17.97L381.2 150.3z"
    	},
    	{
    		name: "stop",
    		width: 384,
    		path: "M384 128v255.1c0 35.35-28.65 64-64 64H64c-35.35 0-64-28.65-64-64V128c0-35.35 28.65-64 64-64H320C355.3 64 384 92.65 384 128z"
    	}
    ];

    function getIcon(iconName) {
    	var _a;

    	return (_a = icons.find(icon => icon.name == iconName)) !== null && _a !== void 0
    	? _a
    	: icons.find(icon => icon.name == "question");
    }

    /* src/MenuBar.svelte generated by Svelte v3.49.0 */
    const file$8 = "src/MenuBar.svelte";

    function create_fragment$9(ctx) {
    	let div;
    	let button;
    	let img;
    	let img_src_value;
    	let t0;
    	let t1;
    	let span;
    	let t2_value = /*$ms*/ ctx[0].location + "";
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			img = element("img");
    			t0 = text("MeanScout");
    			t1 = space();
    			span = element("span");
    			t2 = text(t2_value);
    			attr_dev(img, "class", "text-icon");
    			attr_dev(img, "id", "logo");
    			if (!src_url_equal(img.src, img_src_value = "./logo.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$8, 17, 4, 494);
    			attr_dev(button, "id", "menu-toggle-btn");
    			add_location(button, file$8, 16, 2, 438);
    			attr_dev(span, "id", "location-text");
    			add_location(span, file$8, 19, 2, 577);
    			attr_dev(div, "class", "flex space-between spaced bg extend-bg");
    			add_location(div, file$8, 15, 0, 383);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(button, img);
    			append_dev(button, t0);
    			append_dev(div, t1);
    			append_dev(div, span);
    			append_dev(span, t2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "load", /*load*/ ctx[2], false, false, false),
    					listen_dev(button, "click", /*toggleMenu*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$ms*/ 1 && t2_value !== (t2_value = /*$ms*/ ctx[0].location + "")) set_data_dev(t2, t2_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $ms;
    	validate_store(ms, 'ms');
    	component_subscribe($$self, ms, $$value => $$invalidate(0, $ms = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MenuBar', slots, []);

    	function toggleMenu() {
    		set_store_value(ms, $ms.menuVisible = !$ms.menuVisible, $ms);
    		if ($ms.menuVisible) localStorage.setItem("menuVisible", "true"); else localStorage.removeItem("menuVisible");
    	}

    	function load() {
    		set_store_value(ms, $ms.menuVisible = !!localStorage.getItem("menuVisible"), $ms);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MenuBar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ms, toggleMenu, load, $ms });
    	return [$ms, toggleMenu, load];
    }

    class MenuBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MenuBar",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/IconButton.svelte generated by Svelte v3.49.0 */
    const file$7 = "src/IconButton.svelte";

    function create_fragment$8(ctx) {
    	let button;
    	let svg_1;
    	let path;
    	let path_d_value;
    	let svg_1_viewBox_value;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			svg_1 = svg_element("svg");
    			path = svg_element("path");
    			t = text(/*text*/ ctx[1]);
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "d", path_d_value = /*svg*/ ctx[2].path);
    			add_location(path, file$7, 17, 4, 532);
    			attr_dev(svg_1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg_1, "viewBox", svg_1_viewBox_value = "0 0 " + /*svg*/ ctx[2].width + " 512");
    			toggle_class(svg_1, "text-icon", /*text*/ ctx[1]);
    			add_location(svg_1, file$7, 16, 2, 434);
    			toggle_class(button, "star", /*icon*/ ctx[0].includes("star"));
    			add_location(button, file$7, 15, 0, 379);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, svg_1);
    			append_dev(svg_1, path);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*svg*/ 4 && path_d_value !== (path_d_value = /*svg*/ ctx[2].path)) {
    				attr_dev(path, "d", path_d_value);
    			}

    			if (dirty & /*svg*/ 4 && svg_1_viewBox_value !== (svg_1_viewBox_value = "0 0 " + /*svg*/ ctx[2].width + " 512")) {
    				attr_dev(svg_1, "viewBox", svg_1_viewBox_value);
    			}

    			if (dirty & /*text*/ 2) {
    				toggle_class(svg_1, "text-icon", /*text*/ ctx[1]);
    			}

    			if (dirty & /*text*/ 2) set_data_dev(t, /*text*/ ctx[1]);

    			if (dirty & /*icon*/ 1) {
    				toggle_class(button, "star", /*icon*/ ctx[0].includes("star"));
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('IconButton', slots, []);
    	let { icon = "" } = $$props;
    	let { text = "" } = $$props;

    	/** SVG info for the icon */
    	let svg = { width: 0, path: "" };

    	const writable_props = ['icon', 'text'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<IconButton> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('icon' in $$props) $$invalidate(0, icon = $$props.icon);
    		if ('text' in $$props) $$invalidate(1, text = $$props.text);
    	};

    	$$self.$capture_state = () => ({ getIcon, icon, text, svg });

    	$$self.$inject_state = $$props => {
    		if ('icon' in $$props) $$invalidate(0, icon = $$props.icon);
    		if ('text' in $$props) $$invalidate(1, text = $$props.text);
    		if ('svg' in $$props) $$invalidate(2, svg = $$props.svg);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon*/ 1) {
    			// Svelte updates svg info whenever `icon` changes
    			$$invalidate(2, svg = getIcon(icon));
    		}
    	};

    	return [icon, text, svg, click_handler];
    }

    class IconButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { icon: 0, text: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IconButton",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get icon() {
    		throw new Error("<IconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<IconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<IconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<IconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Metric.svelte generated by Svelte v3.49.0 */
    const file$6 = "src/Metric.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    // (54:0) {#if group}
    function create_if_block_8(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*group*/ ctx[3]);
    			attr_dev(span, "class", "group");
    			add_location(span, file$6, 54, 2, 1306);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*group*/ 8) set_data_dev(t, /*group*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(54:0) {#if group}",
    		ctx
    	});

    	return block;
    }

    // (58:2) {#if type != "toggle"}
    function create_if_block_7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*name*/ ctx[1]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*name*/ 2) set_data_dev(t, /*name*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(58:2) {#if type != \\\"toggle\\\"}",
    		ctx
    	});

    	return block;
    }

    // (82:30) 
    function create_if_block_6(ctx) {
    	let iconbutton0;
    	let t0;
    	let span;
    	let t1;
    	let t2;
    	let iconbutton1;
    	let current;

    	iconbutton0 = new IconButton({
    			props: {
    				icon: /*running*/ ctx[6] ? "pause" : "play"
    			},
    			$$inline: true
    		});

    	iconbutton0.$on("click", function () {
    		if (is_function(/*running*/ ctx[6] ? /*pause*/ ctx[8] : /*start*/ ctx[7])) (/*running*/ ctx[6] ? /*pause*/ ctx[8] : /*start*/ ctx[7]).apply(this, arguments);
    	});

    	iconbutton1 = new IconButton({ props: { icon: "stop" }, $$inline: true });
    	iconbutton1.$on("click", /*stop*/ ctx[9]);

    	const block = {
    		c: function create() {
    			create_component(iconbutton0.$$.fragment);
    			t0 = space();
    			span = element("span");
    			t1 = text(/*value*/ ctx[0]);
    			t2 = space();
    			create_component(iconbutton1.$$.fragment);
    			attr_dev(span, "class", "number");
    			add_location(span, file$6, 83, 6, 2441);
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbutton0, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t1);
    			insert_dev(target, t2, anchor);
    			mount_component(iconbutton1, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const iconbutton0_changes = {};
    			if (dirty & /*running*/ 64) iconbutton0_changes.icon = /*running*/ ctx[6] ? "pause" : "play";
    			iconbutton0.$set(iconbutton0_changes);
    			if (!current || dirty & /*value*/ 1) set_data_dev(t1, /*value*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbutton0.$$.fragment, local);
    			transition_in(iconbutton1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbutton0.$$.fragment, local);
    			transition_out(iconbutton1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbutton0, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t2);
    			destroy_component(iconbutton1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(82:30) ",
    		ctx
    	});

    	return block;
    }

    // (78:31) 
    function create_if_block_5(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = [...Array(5).keys()];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*value, Array*/ 1) {
    				each_value_1 = [...Array(5).keys()];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(78:31) ",
    		ctx
    	});

    	return block;
    }

    // (76:36) 
    function create_if_block_4(ctx) {
    	let textarea;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			textarea = element("textarea");
    			attr_dev(textarea, "placeholder", /*tip*/ ctx[5]);
    			attr_dev(textarea, "cols", "50");
    			attr_dev(textarea, "rows", "5");
    			set_style(textarea, "resize", "none");
    			attr_dev(textarea, "class", "svelte-1dpnoe9");
    			add_location(textarea, file$6, 76, 8, 2056);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea, anchor);
    			set_input_value(textarea, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[15]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tip*/ 32) {
    				attr_dev(textarea, "placeholder", /*tip*/ ctx[5]);
    			}

    			if (dirty & /*value, values*/ 17) {
    				set_input_value(textarea, /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(76:36) ",
    		ctx
    	});

    	return block;
    }

    // (74:29) 
    function create_if_block_3(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "placeholder", /*tip*/ ctx[5]);
    			add_location(input, file$6, 74, 6, 1972);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[14]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tip*/ 32) {
    				attr_dev(input, "placeholder", /*tip*/ ctx[5]);
    			}

    			if (dirty & /*value, values*/ 17 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(74:29) ",
    		ctx
    	});

    	return block;
    }

    // (68:31) 
    function create_if_block_2(ctx) {
    	let select;
    	let mounted;
    	let dispose;
    	let each_value = /*values*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (/*value*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[13].call(select));
    			add_location(select, file$6, 68, 6, 1809);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[13]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*values*/ 16) {
    				each_value = /*values*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*value, values*/ 17) {
    				select_option(select, /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(68:31) ",
    		ctx
    	});

    	return block;
    }

    // (64:31) 
    function create_if_block_1(ctx) {
    	let iconbutton0;
    	let t0;
    	let span;
    	let t1;
    	let t2;
    	let iconbutton1;
    	let current;
    	iconbutton0 = new IconButton({ props: { icon: "plus" }, $$inline: true });
    	iconbutton0.$on("click", /*click_handler_1*/ ctx[11]);
    	iconbutton1 = new IconButton({ props: { icon: "minus" }, $$inline: true });
    	iconbutton1.$on("click", /*click_handler_2*/ ctx[12]);

    	const block = {
    		c: function create() {
    			create_component(iconbutton0.$$.fragment);
    			t0 = space();
    			span = element("span");
    			t1 = text(/*value*/ ctx[0]);
    			t2 = space();
    			create_component(iconbutton1.$$.fragment);
    			attr_dev(span, "class", "number");
    			add_location(span, file$6, 65, 6, 1676);
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbutton0, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t1);
    			insert_dev(target, t2, anchor);
    			mount_component(iconbutton1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*value*/ 1) set_data_dev(t1, /*value*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbutton0.$$.fragment, local);
    			transition_in(iconbutton1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbutton0.$$.fragment, local);
    			transition_out(iconbutton1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbutton0, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t2);
    			destroy_component(iconbutton1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(64:31) ",
    		ctx
    	});

    	return block;
    }

    // (62:4) {#if type == "toggle"}
    function create_if_block(ctx) {
    	let iconbutton;
    	let current;

    	iconbutton = new IconButton({
    			props: {
    				icon: /*value*/ ctx[0] ? "check" : "nocheck",
    				text: /*name*/ ctx[1]
    			},
    			$$inline: true
    		});

    	iconbutton.$on("click", /*click_handler*/ ctx[10]);

    	const block = {
    		c: function create() {
    			create_component(iconbutton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbutton, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const iconbutton_changes = {};
    			if (dirty & /*value*/ 1) iconbutton_changes.icon = /*value*/ ctx[0] ? "check" : "nocheck";
    			if (dirty & /*name*/ 2) iconbutton_changes.text = /*name*/ ctx[1];
    			iconbutton.$set(iconbutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(62:4) {#if type == \\\"toggle\\\"}",
    		ctx
    	});

    	return block;
    }

    // (79:6) {#each [...Array(5).keys()] as i}
    function create_each_block_1(ctx) {
    	let iconbutton;
    	let current;

    	function click_handler_3() {
    		return /*click_handler_3*/ ctx[16](/*i*/ ctx[22]);
    	}

    	iconbutton = new IconButton({
    			props: {
    				icon: /*value*/ ctx[0] >= /*i*/ ctx[22] ? "star" : "nostar"
    			},
    			$$inline: true
    		});

    	iconbutton.$on("click", click_handler_3);

    	const block = {
    		c: function create() {
    			create_component(iconbutton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbutton, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const iconbutton_changes = {};
    			if (dirty & /*value*/ 1) iconbutton_changes.icon = /*value*/ ctx[0] >= /*i*/ ctx[22] ? "star" : "nostar";
    			iconbutton.$set(iconbutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(79:6) {#each [...Array(5).keys()] as i}",
    		ctx
    	});

    	return block;
    }

    // (70:8) {#each values as val}
    function create_each_block$2(ctx) {
    	let option;
    	let t_value = /*val*/ ctx[19] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*val*/ ctx[19];
    			option.value = option.__value;
    			add_location(option, file$6, 70, 10, 1869);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*values*/ 16 && t_value !== (t_value = /*val*/ ctx[19] + "")) set_data_dev(t, t_value);

    			if (dirty & /*values*/ 16 && option_value_value !== (option_value_value = /*val*/ ctx[19])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(70:8) {#each values as val}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let t0;
    	let div1;
    	let t1;
    	let div0;
    	let current_block_type_index;
    	let if_block2;
    	let current;
    	let if_block0 = /*group*/ ctx[3] && create_if_block_8(ctx);
    	let if_block1 = /*type*/ ctx[2] != "toggle" && create_if_block_7(ctx);

    	const if_block_creators = [
    		create_if_block,
    		create_if_block_1,
    		create_if_block_2,
    		create_if_block_3,
    		create_if_block_4,
    		create_if_block_5,
    		create_if_block_6
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*type*/ ctx[2] == "toggle") return 0;
    		if (/*type*/ ctx[2] == "number") return 1;
    		if (/*type*/ ctx[2] == "select") return 2;
    		if (/*type*/ ctx[2] == "text") return 3;
    		if (/*type*/ ctx[2] == "paragraph") return 4;
    		if (/*type*/ ctx[2] == "rating") return 5;
    		if (/*type*/ ctx[2] == "timer") return 6;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			if (if_block1) if_block1.c();
    			t1 = space();
    			div0 = element("div");
    			if (if_block2) if_block2.c();
    			attr_dev(div0, "class", "flex");
    			add_location(div0, file$6, 60, 2, 1432);
    			toggle_class(div1, "max-width", /*type*/ ctx[2] == "text");
    			add_location(div1, file$6, 56, 0, 1347);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*group*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_8(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*type*/ ctx[2] != "toggle") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_7(ctx);
    					if_block1.c();
    					if_block1.m(div1, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block2) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block2 = if_blocks[current_block_type_index];

    					if (!if_block2) {
    						if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block2.c();
    					} else {
    						if_block2.p(ctx, dirty);
    					}

    					transition_in(if_block2, 1);
    					if_block2.m(div0, null);
    				} else {
    					if_block2 = null;
    				}
    			}

    			if (dirty & /*type*/ 4) {
    				toggle_class(div1, "max-width", /*type*/ ctx[2] == "text");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (if_block1) if_block1.d();

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Metric', slots, []);
    	const dispatch = createEventDispatcher();
    	let { name = "" } = $$props;
    	let { type = "" } = $$props;
    	let { value = null } = $$props;
    	let { group = "" } = $$props;
    	let { values = [] } = $$props;
    	let { tip = "" } = $$props;

    	/** (`timer`) Whether the timer is running */
    	let running = false;

    	/** (`timer`) Interval reference for the timer */
    	let interval;

    	/** (`timer` function) */
    	function start() {
    		$$invalidate(6, running = true);

    		interval = setInterval(
    			() => {
    				if (running) $$invalidate(0, value = (parseFloat(value) + 0.1).toFixed(1));
    			},
    			100
    		);
    	}

    	/** (`timer` function) */
    	function pause() {
    		$$invalidate(6, running = false);
    		clearInterval(interval);
    	}

    	/** (`timer` function) */
    	function stop() {
    		if (type == "timer") {
    			if (running) pause();
    			$$invalidate(0, value = 0);
    		}
    	}

    	const writable_props = ['name', 'type', 'value', 'group', 'values', 'tip'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Metric> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, value = !value);
    	const click_handler_1 = () => $$invalidate(0, value++, value);
    	const click_handler_2 = () => $$invalidate(0, value--, value);

    	function select_change_handler() {
    		value = select_value(this);
    		$$invalidate(0, value);
    		$$invalidate(4, values);
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    		$$invalidate(4, values);
    	}

    	function textarea_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    		$$invalidate(4, values);
    	}

    	const click_handler_3 = i => $$invalidate(0, value = i);

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('type' in $$props) $$invalidate(2, type = $$props.type);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('group' in $$props) $$invalidate(3, group = $$props.group);
    		if ('values' in $$props) $$invalidate(4, values = $$props.values);
    		if ('tip' in $$props) $$invalidate(5, tip = $$props.tip);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		IconButton,
    		dispatch,
    		name,
    		type,
    		value,
    		group,
    		values,
    		tip,
    		running,
    		interval,
    		start,
    		pause,
    		stop
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('type' in $$props) $$invalidate(2, type = $$props.type);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('group' in $$props) $$invalidate(3, group = $$props.group);
    		if ('values' in $$props) $$invalidate(4, values = $$props.values);
    		if ('tip' in $$props) $$invalidate(5, tip = $$props.tip);
    		if ('running' in $$props) $$invalidate(6, running = $$props.running);
    		if ('interval' in $$props) interval = $$props.interval;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 1) {
    			// Svelte calls `dispatch()` whenever `value` changes
    			{
    				dispatch("update");
    			}
    		}
    	};

    	return [
    		value,
    		name,
    		type,
    		group,
    		values,
    		tip,
    		running,
    		start,
    		pause,
    		stop,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		select_change_handler,
    		input_input_handler,
    		textarea_input_handler,
    		click_handler_3
    	];
    }

    class Metric extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			name: 1,
    			type: 2,
    			value: 0,
    			group: 3,
    			values: 4,
    			tip: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Metric",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get name() {
    		throw new Error("<Metric>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Metric>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Metric>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Metric>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Metric>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Metric>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get group() {
    		throw new Error("<Metric>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set group(value) {
    		throw new Error("<Metric>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get values() {
    		throw new Error("<Metric>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set values(value) {
    		throw new Error("<Metric>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tip() {
    		throw new Error("<Metric>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tip(value) {
    		throw new Error("<Metric>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/TemplateMenu.svelte generated by Svelte v3.49.0 */

    const { Object: Object_1$3 } = globals;
    const file$5 = "src/TemplateMenu.svelte";

    function create_fragment$6(ctx) {
    	let span;
    	let t1;
    	let iconbutton0;
    	let t2;
    	let iconbutton1;
    	let current;

    	iconbutton0 = new IconButton({
    			props: { icon: "copy", text: "Copy" },
    			$$inline: true
    		});

    	iconbutton0.$on("click", /*copyTemplate*/ ctx[0]);

    	iconbutton1 = new IconButton({
    			props: { icon: "pen", text: "Edit" },
    			$$inline: true
    		});

    	iconbutton1.$on("click", /*editTemplate*/ ctx[1]);

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Template";
    			t1 = space();
    			create_component(iconbutton0.$$.fragment);
    			t2 = space();
    			create_component(iconbutton1.$$.fragment);
    			attr_dev(span, "class", "group");
    			add_location(span, file$5, 78, 0, 3139);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(iconbutton0, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(iconbutton1, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbutton0.$$.fragment, local);
    			transition_in(iconbutton1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbutton0.$$.fragment, local);
    			transition_out(iconbutton1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t1);
    			destroy_component(iconbutton0, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(iconbutton1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $ms;
    	validate_store(ms, 'ms');
    	component_subscribe($$self, ms, $$value => $$invalidate(2, $ms = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TemplateMenu', slots, []);

    	function copyTemplate() {
    		let templateString = JSON.stringify($ms.template);

    		if ("clipboard" in navigator) {
    			navigator.clipboard.writeText(templateString);
    			alert("Copied template");
    		} else prompt("Copy the template below", templateString);
    	}

    	/**
     * Sets a new template (or resets to `exampleTemplate`), updates `localStorage` and `$ms.metrics`
     * @param newTemplate (optional) The template to use
     */
    	function setTemplate(newTemplate) {
    		set_store_value(
    			ms,
    			$ms.template = JSON.parse(JSON.stringify(newTemplate !== null && newTemplate !== void 0
    			? newTemplate
    			: exampleTemplate)),
    			$ms
    		);

    		localStorage.setItem("template", JSON.stringify($ms.template));
    		localStorage.removeItem("backup");

    		set_store_value(
    			ms,
    			$ms.metrics = $ms.template.metrics.map(metric => {
    				let defaultValue = getMetricDefaultValue(metric.type);
    				if (metric.type == "select") defaultValue = metric.values[0];

    				return Object.assign(Object.assign({}, metric), {
    					value: defaultValue,
    					default: defaultValue
    				});
    			}),
    			$ms
    		);
    	}

    	/**
     * Checks if a stringified template is valid
     * @param templateString A stringified template
     * @returns An object containing a template object or error string
     */
    	function validateTemplate(templateString) {
    		var _a;
    		let result = { template: null, error: "" };

    		try {
    			result.template = JSON.parse(templateString);
    		} catch(e) {
    			result.error = e;
    			return result;
    		}

    		if (!Array.isArray((_a = result.template.teams) !== null && _a !== void 0
    		? _a
    		: [])) result.error += "Template has invalid teams";

    		if (!result.template.metrics) result.error += "\nTemplate has no metrics"; else {
    			result.template.metrics.forEach((metric, i) => {
    				var _a, _b, _c;
    				if (!metric.name) result.error += `\nMetric ${i + 1} has no name`;

    				if (metric.type == "select" && !Array.isArray((_a = metric.values) !== null && _a !== void 0 ? _a : [])) result.error += `\nMetric ${(_b = metric.name) !== null && _b !== void 0
				? _b
				: i + 1} has invalid values`;

    				if (!metricDefaults.some(type => type.name == metric.type)) result.error += `\nMetric ${(_c = metric.name) !== null && _c !== void 0
				? _c
				: i + 1} has invalid type`;
    			});
    		}

    		return result;
    	}

    	/** Prompts the user to enter a new template, or reset to `exampleTemplate` */
    	function editTemplate() {
    		const newPrompt = prompt("Paste new template (you can also 'reset'):");

    		if (newPrompt) {
    			if (newPrompt == "reset") {
    				setTemplate();
    				localStorage.removeItem("template");
    			} else {
    				let result = validateTemplate(newPrompt);
    				if (result.error) alert(`Could not set template! ${result.error}`); else setTemplate(result.template);
    			}
    		}
    	}

    	const writable_props = [];

    	Object_1$3.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TemplateMenu> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		ms,
    		exampleTemplate,
    		metricDefaults,
    		getMetricDefaultValue,
    		IconButton,
    		copyTemplate,
    		setTemplate,
    		validateTemplate,
    		editTemplate,
    		$ms
    	});

    	return [copyTemplate, editTemplate];
    }

    class TemplateMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TemplateMenu",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/SurveysMenu.svelte generated by Svelte v3.49.0 */

    const { Object: Object_1$2 } = globals;
    const file$4 = "src/SurveysMenu.svelte";

    function create_fragment$5(ctx) {
    	let span;
    	let t1;
    	let metric;
    	let updating_value;
    	let t2;
    	let iconbutton0;
    	let t3;
    	let iconbutton1;
    	let current;

    	function metric_value_binding(value) {
    		/*metric_value_binding*/ ctx[2](value);
    	}

    	let metric_props = {
    		name: "Type",
    		type: "select",
    		values: Object.values(fileFormats)
    	};

    	if (/*surveyType*/ ctx[0] !== void 0) {
    		metric_props.value = /*surveyType*/ ctx[0];
    	}

    	metric = new Metric({ props: metric_props, $$inline: true });
    	binding_callbacks.push(() => bind(metric, 'value', metric_value_binding));

    	iconbutton0 = new IconButton({
    			props: { icon: "download", text: "Download" },
    			$$inline: true
    		});

    	iconbutton0.$on("click", /*askDownloadSurveys*/ ctx[1]);

    	iconbutton1 = new IconButton({
    			props: { icon: "erase", text: "Erase" },
    			$$inline: true
    		});

    	iconbutton1.$on("click", eraseSurveys);

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Surveys";
    			t1 = space();
    			create_component(metric.$$.fragment);
    			t2 = space();
    			create_component(iconbutton0.$$.fragment);
    			t3 = space();
    			create_component(iconbutton1.$$.fragment);
    			attr_dev(span, "class", "group");
    			add_location(span, file$4, 53, 0, 1926);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(metric, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(iconbutton0, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(iconbutton1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const metric_changes = {};

    			if (!updating_value && dirty & /*surveyType*/ 1) {
    				updating_value = true;
    				metric_changes.value = /*surveyType*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			metric.$set(metric_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(metric.$$.fragment, local);
    			transition_in(iconbutton0.$$.fragment, local);
    			transition_in(iconbutton1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(metric.$$.fragment, local);
    			transition_out(iconbutton0.$$.fragment, local);
    			transition_out(iconbutton1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t1);
    			destroy_component(metric, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(iconbutton0, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(iconbutton1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function generateCSV(surveys) {
    	let csv = "";

    	if (surveys) {
    		surveys.forEach(survey => {
    			let surveyAsCSV = "";

    			survey.forEach(metric => {
    				if (typeof metric.value == "string") surveyAsCSV += '"' + metric.value + '",'; else surveyAsCSV += metric.value + ",";
    			});

    			csv += surveyAsCSV + "\n";
    		});
    	}

    	return csv;
    }

    /** Confirms the user wants to erase stored surveys in `localStorage`, doing so if they confirm */
    function eraseSurveys() {
    	if (prompt("Type 'erase' to erase saved surveys") == "erase") localStorage.removeItem("surveys");
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SurveysMenu', slots, []);
    	let surveyType = "CSV";

    	/** Creates and downloads a file containing surveys */
    	function downloadSurveys() {
    		let storedSurveys = localStorage.getItem("surveys");

    		if (storedSurveys) {
    			const anchor = document.createElement("a");
    			anchor.href = "data:text/plain;charset=utf-8,";
    			if (surveyType == "CSV") anchor.href += encodeURIComponent(generateCSV(JSON.parse(storedSurveys))); else if (surveyType == "JSON") anchor.href += encodeURIComponent(storedSurveys);
    			anchor.download = `surveys.${surveyType.toLowerCase()}`;
    			document.body.append(anchor);
    			anchor.click();
    			anchor.remove();
    		}
    	}

    	/** Checks if the user wants to download surveys, doing so if they confirm */
    	function askDownloadSurveys() {
    		if (confirm("Confirm download?")) downloadSurveys();
    	}

    	const writable_props = [];

    	Object_1$2.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SurveysMenu> was created with unknown prop '${key}'`);
    	});

    	function metric_value_binding(value) {
    		surveyType = value;
    		$$invalidate(0, surveyType);
    	}

    	$$self.$capture_state = () => ({
    		fileFormats,
    		IconButton,
    		Metric,
    		surveyType,
    		generateCSV,
    		downloadSurveys,
    		askDownloadSurveys,
    		eraseSurveys
    	});

    	$$self.$inject_state = $$props => {
    		if ('surveyType' in $$props) $$invalidate(0, surveyType = $$props.surveyType);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [surveyType, askDownloadSurveys, metric_value_binding];
    }

    class SurveysMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SurveysMenu",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/Menu.svelte generated by Svelte v3.49.0 */

    const { Object: Object_1$1 } = globals;
    const file$3 = "src/Menu.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let span;
    	let t1;
    	let metric;
    	let updating_value;
    	let t2;
    	let templatemenu;
    	let t3;
    	let surveysmenu;
    	let current;
    	let mounted;
    	let dispose;

    	function metric_value_binding(value) {
    		/*metric_value_binding*/ ctx[3](value);
    	}

    	let metric_props = {
    		name: "Location",
    		type: "select",
    		values: Object.values(locations)
    	};

    	if (/*$ms*/ ctx[0].location !== void 0) {
    		metric_props.value = /*$ms*/ ctx[0].location;
    	}

    	metric = new Metric({ props: metric_props, $$inline: true });
    	binding_callbacks.push(() => bind(metric, 'value', metric_value_binding));
    	metric.$on("update", /*locationUpdated*/ ctx[1]);
    	templatemenu = new TemplateMenu({ $$inline: true });
    	surveysmenu = new SurveysMenu({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "Options";
    			t1 = space();
    			create_component(metric.$$.fragment);
    			t2 = space();
    			create_component(templatemenu.$$.fragment);
    			t3 = space();
    			create_component(surveysmenu.$$.fragment);
    			attr_dev(span, "class", "group");
    			add_location(span, file$3, 27, 2, 1028);
    			attr_dev(div, "class", "flex spaced bg extend-bg");
    			attr_dev(div, "id", "menu");
    			toggle_class(div, "hide", !/*$ms*/ ctx[0].menuVisible);
    			add_location(div, file$3, 26, 0, 947);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(div, t1);
    			mount_component(metric, div, null);
    			append_dev(div, t2);
    			mount_component(templatemenu, div, null);
    			append_dev(div, t3);
    			mount_component(surveysmenu, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "load", /*load*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const metric_changes = {};

    			if (!updating_value && dirty & /*$ms*/ 1) {
    				updating_value = true;
    				metric_changes.value = /*$ms*/ ctx[0].location;
    				add_flush_callback(() => updating_value = false);
    			}

    			metric.$set(metric_changes);

    			if (dirty & /*$ms*/ 1) {
    				toggle_class(div, "hide", !/*$ms*/ ctx[0].menuVisible);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(metric.$$.fragment, local);
    			transition_in(templatemenu.$$.fragment, local);
    			transition_in(surveysmenu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(metric.$$.fragment, local);
    			transition_out(templatemenu.$$.fragment, local);
    			transition_out(surveysmenu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(metric);
    			destroy_component(templatemenu);
    			destroy_component(surveysmenu);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $ms;
    	validate_store(ms, 'ms');
    	component_subscribe($$self, ms, $$value => $$invalidate(0, $ms = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Menu', slots, []);

    	function locationUpdated() {
    		localStorage.setItem("location", $ms.location);
    		let newTheme = "";
    		if ($ms.location.toLowerCase().includes("red")) newTheme = "red"; else if ($ms.location.toLowerCase().includes("blue")) newTheme = "blue";
    		document.documentElement.style.setProperty("--theme-color", `var(--${newTheme})`);
    	}

    	/** Sets `$ms.location` if already set in `localStorage` */
    	function load() {
    		let storedLocation = localStorage.getItem("location");

    		if (locations.some(location => location == storedLocation)) {
    			set_store_value(ms, $ms.location = storedLocation, $ms);
    			locationUpdated();
    		}
    	}

    	const writable_props = [];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	function metric_value_binding(value) {
    		if ($$self.$$.not_equal($ms.location, value)) {
    			$ms.location = value;
    			ms.set($ms);
    		}
    	}

    	$$self.$capture_state = () => ({
    		ms,
    		locations,
    		Metric,
    		TemplateMenu,
    		SurveysMenu,
    		locationUpdated,
    		load,
    		$ms
    	});

    	return [$ms, locationUpdated, load, metric_value_binding];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/DefaultMetrics.svelte generated by Svelte v3.49.0 */
    const file$2 = "src/DefaultMetrics.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (11:6) {#each $ms.template?.teams ?? [] as team}
    function create_each_block$1(ctx) {
    	let option;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			option.__value = option_value_value = /*team*/ ctx[7];
    			option.value = option.__value;
    			add_location(option, file$2, 11, 8, 404);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$ms*/ 1 && option_value_value !== (option_value_value = /*team*/ ctx[7])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(11:6) {#each $ms.template?.teams ?? [] as team}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div2;
    	let span;
    	let t1;
    	let div0;
    	let t2;
    	let input0;
    	let t3;
    	let datalist;
    	let t4;
    	let div1;
    	let t5;
    	let input1;
    	let t6;
    	let metric;
    	let updating_value;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*$ms*/ ctx[0].template?.teams ?? [];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	function metric_value_binding(value) {
    		/*metric_value_binding*/ ctx[5](value);
    	}

    	let metric_props = { name: "Absent", type: "toggle" };

    	if (/*$ms*/ ctx[0].isAbsent !== void 0) {
    		metric_props.value = /*$ms*/ ctx[0].isAbsent;
    	}

    	metric = new Metric({ props: metric_props, $$inline: true });
    	binding_callbacks.push(() => bind(metric, 'value', metric_value_binding));
    	metric.$on("update", /*update_handler*/ ctx[6]);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			span = element("span");
    			span.textContent = "Info";
    			t1 = space();
    			div0 = element("div");
    			t2 = text("Team\n    ");
    			input0 = element("input");
    			t3 = space();
    			datalist = element("datalist");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			div1 = element("div");
    			t5 = text("Match\n    ");
    			input1 = element("input");
    			t6 = space();
    			create_component(metric.$$.fragment);
    			attr_dev(span, "class", "group");
    			add_location(span, file$2, 5, 2, 147);
    			attr_dev(input0, "id", "metric-team");
    			attr_dev(input0, "list", "teams-list");
    			attr_dev(input0, "maxlength", "5");
    			add_location(input0, file$2, 8, 4, 200);
    			attr_dev(datalist, "id", "teams-list");
    			add_location(datalist, file$2, 9, 4, 321);
    			add_location(div0, file$2, 6, 2, 181);
    			attr_dev(input1, "id", "metric-match");
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "pattern", "[0-9]*");
    			add_location(input1, file$2, 17, 4, 489);
    			add_location(div1, file$2, 15, 2, 469);
    			attr_dev(div2, "class", "flex spaced");
    			add_location(div2, file$2, 4, 0, 119);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, span);
    			append_dev(div2, t1);
    			append_dev(div2, div0);
    			append_dev(div0, t2);
    			append_dev(div0, input0);
    			set_input_value(input0, /*$ms*/ ctx[0].team);
    			append_dev(div0, t3);
    			append_dev(div0, datalist);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(datalist, null);
    			}

    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, t5);
    			append_dev(div1, input1);
    			set_input_value(input1, /*$ms*/ ctx[0].match);
    			append_dev(div2, t6);
    			mount_component(metric, div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[1]),
    					listen_dev(input0, "change", /*change_handler*/ ctx[2], false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[3]),
    					listen_dev(input1, "change", /*change_handler_1*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$ms*/ 1 && input0.value !== /*$ms*/ ctx[0].team) {
    				set_input_value(input0, /*$ms*/ ctx[0].team);
    			}

    			if (dirty & /*$ms*/ 1) {
    				each_value = /*$ms*/ ctx[0].template?.teams ?? [];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(datalist, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$ms*/ 1 && to_number(input1.value) !== /*$ms*/ ctx[0].match) {
    				set_input_value(input1, /*$ms*/ ctx[0].match);
    			}

    			const metric_changes = {};

    			if (!updating_value && dirty & /*$ms*/ 1) {
    				updating_value = true;
    				metric_changes.value = /*$ms*/ ctx[0].isAbsent;
    				add_flush_callback(() => updating_value = false);
    			}

    			metric.$set(metric_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(metric.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(metric.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			destroy_component(metric);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $ms;
    	validate_store(ms, 'ms');
    	component_subscribe($$self, ms, $$value => $$invalidate(0, $ms = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('DefaultMetrics', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<DefaultMetrics> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		$ms.team = this.value;
    		ms.set($ms);
    	}

    	const change_handler = () => backupSurvey($ms);

    	function input1_input_handler() {
    		$ms.match = to_number(this.value);
    		ms.set($ms);
    	}

    	const change_handler_1 = () => backupSurvey($ms);

    	function metric_value_binding(value) {
    		if ($$self.$$.not_equal($ms.isAbsent, value)) {
    			$ms.isAbsent = value;
    			ms.set($ms);
    		}
    	}

    	const update_handler = () => backupSurvey($ms);
    	$$self.$capture_state = () => ({ ms, backupSurvey, Metric, $ms });

    	return [
    		$ms,
    		input0_input_handler,
    		change_handler,
    		input1_input_handler,
    		change_handler_1,
    		metric_value_binding,
    		update_handler
    	];
    }

    class DefaultMetrics extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DefaultMetrics",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/CustomMetrics.svelte generated by Svelte v3.49.0 */
    const file$1 = "src/CustomMetrics.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[5] = list;
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (6:2) {#each $ms.template?.metrics ?? [] as metric, i}
    function create_each_block(ctx) {
    	let metric;
    	let updating_name;
    	let updating_value;
    	let current;
    	const metric_spread_levels = [/*metric*/ ctx[4]];

    	function metric_name_binding(value) {
    		/*metric_name_binding*/ ctx[1](value, /*i*/ ctx[6]);
    	}

    	function metric_value_binding(value) {
    		/*metric_value_binding*/ ctx[2](value, /*i*/ ctx[6]);
    	}

    	let metric_props = {};

    	for (let i = 0; i < metric_spread_levels.length; i += 1) {
    		metric_props = assign(metric_props, metric_spread_levels[i]);
    	}

    	if (/*$ms*/ ctx[0].metrics[/*i*/ ctx[6]].name !== void 0) {
    		metric_props.name = /*$ms*/ ctx[0].metrics[/*i*/ ctx[6]].name;
    	}

    	if (/*$ms*/ ctx[0].metrics[/*i*/ ctx[6]].value !== void 0) {
    		metric_props.value = /*$ms*/ ctx[0].metrics[/*i*/ ctx[6]].value;
    	}

    	metric = new Metric({ props: metric_props, $$inline: true });
    	binding_callbacks.push(() => bind(metric, 'name', metric_name_binding));
    	binding_callbacks.push(() => bind(metric, 'value', metric_value_binding));
    	metric.$on("update", /*update_handler*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(metric.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(metric, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			const metric_changes = (dirty & /*$ms*/ 1)
    			? get_spread_update(metric_spread_levels, [get_spread_object(/*metric*/ ctx[4])])
    			: {};

    			if (!updating_name && dirty & /*$ms*/ 1) {
    				updating_name = true;
    				metric_changes.name = /*$ms*/ ctx[0].metrics[/*i*/ ctx[6]].name;
    				add_flush_callback(() => updating_name = false);
    			}

    			if (!updating_value && dirty & /*$ms*/ 1) {
    				updating_value = true;
    				metric_changes.value = /*$ms*/ ctx[0].metrics[/*i*/ ctx[6]].value;
    				add_flush_callback(() => updating_value = false);
    			}

    			metric.$set(metric_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(metric.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(metric.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(metric, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(6:2) {#each $ms.template?.metrics ?? [] as metric, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let current;
    	let each_value = /*$ms*/ ctx[0].template?.metrics ?? [];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "flex spaced");
    			toggle_class(div, "hide", /*$ms*/ ctx[0].isAbsent);
    			add_location(div, file$1, 4, 0, 119);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$ms, backupSurvey*/ 1) {
    				each_value = /*$ms*/ ctx[0].template?.metrics ?? [];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*$ms*/ 1) {
    				toggle_class(div, "hide", /*$ms*/ ctx[0].isAbsent);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $ms;
    	validate_store(ms, 'ms');
    	component_subscribe($$self, ms, $$value => $$invalidate(0, $ms = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CustomMetrics', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CustomMetrics> was created with unknown prop '${key}'`);
    	});

    	function metric_name_binding(value, i) {
    		if ($$self.$$.not_equal($ms.metrics[i].name, value)) {
    			$ms.metrics[i].name = value;
    			ms.set($ms);
    		}
    	}

    	function metric_value_binding(value, i) {
    		if ($$self.$$.not_equal($ms.metrics[i].value, value)) {
    			$ms.metrics[i].value = value;
    			ms.set($ms);
    		}
    	}

    	const update_handler = () => backupSurvey($ms);
    	$$self.$capture_state = () => ({ ms, backupSurvey, Metric, $ms });
    	return [$ms, metric_name_binding, metric_value_binding, update_handler];
    }

    class CustomMetrics extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CustomMetrics",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/SurveyBar.svelte generated by Svelte v3.49.0 */
    const file = "src/SurveyBar.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let iconbutton0;
    	let t;
    	let iconbutton1;
    	let current;

    	iconbutton0 = new IconButton({
    			props: { icon: "save", text: "Save" },
    			$$inline: true
    		});

    	iconbutton0.$on("click", /*saveSurvey*/ ctx[0]);

    	iconbutton1 = new IconButton({
    			props: { icon: "reset", text: "Reset" },
    			$$inline: true
    		});

    	iconbutton1.$on("click", /*askResetSurvey*/ ctx[1]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(iconbutton0.$$.fragment);
    			t = space();
    			create_component(iconbutton1.$$.fragment);
    			attr_dev(div, "class", "flex space-between spaced bg extend-bg extend-down");
    			add_location(div, file, 40, 0, 1442);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(iconbutton0, div, null);
    			append_dev(div, t);
    			mount_component(iconbutton1, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbutton0.$$.fragment, local);
    			transition_in(iconbutton1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbutton0.$$.fragment, local);
    			transition_out(iconbutton1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(iconbutton0);
    			destroy_component(iconbutton1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $ms;
    	validate_store(ms, 'ms');
    	component_subscribe($$self, ms, $$value => $$invalidate(2, $ms = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SurveyBar', slots, []);

    	function validateSurvey() {
    		if (!(/^\d{1,4}[A-Z]?$/).test($ms.team)) return "Invalid team value";

    		if ($ms.template.teams) {
    			if (!$ms.template.teams.some(team => team == $ms.team)) return "Team value not whitelisted";
    		}

    		if (!(/\d{1,3}/).test(`${$ms.match}`)) return "Invalid match value";
    		return "";
    	}

    	/** Checks and saves survey to `localStorage`, then updates the UI */
    	function saveSurvey() {
    		var _a;
    		let error = validateSurvey();

    		if (error) alert(`Could not save survey! ${error}`); else if (confirm("Confirm save?")) {
    			let updatedSurveys = JSON.stringify([
    				...JSON.parse((_a = localStorage.getItem("surveys")) !== null && _a !== void 0
    				? _a
    				: "[]"),
    				getSurvey($ms)
    			]);

    			localStorage.setItem("surveys", updatedSurveys);
    			resetSurvey();
    			set_store_value(ms, $ms.match++, $ms);
    		}
    	}

    	/** Resets all metrics excluding match */
    	function resetSurvey() {
    		set_store_value(ms, $ms.team = "", $ms);
    		set_store_value(ms, $ms.isAbsent = false, $ms);
    		$ms.metrics.forEach(metric => metric.value = metric.default);
    	}

    	/** Prompts the user if they want to reset, then calls `resetSurvey()` */
    	function askResetSurvey() {
    		if (prompt("Type 'reset' to reset the survey") == "reset") resetSurvey();
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SurveyBar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		ms,
    		getSurvey,
    		IconButton,
    		validateSurvey,
    		saveSurvey,
    		resetSurvey,
    		askResetSurvey,
    		$ms
    	});

    	return [saveSurvey, askResetSurvey];
    }

    class SurveyBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SurveyBar",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.49.0 */

    const { Object: Object_1, console: console_1 } = globals;

    function create_fragment(ctx) {
    	let menubar;
    	let t0;
    	let menu;
    	let t1;
    	let defaultmetrics;
    	let t2;
    	let custommetrics;
    	let t3;
    	let surveybar;
    	let current;
    	let mounted;
    	let dispose;
    	menubar = new MenuBar({ $$inline: true });
    	menu = new Menu({ $$inline: true });
    	defaultmetrics = new DefaultMetrics({ $$inline: true });
    	custommetrics = new CustomMetrics({ $$inline: true });
    	surveybar = new SurveyBar({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(menubar.$$.fragment);
    			t0 = space();
    			create_component(menu.$$.fragment);
    			t1 = space();
    			create_component(defaultmetrics.$$.fragment);
    			t2 = space();
    			create_component(custommetrics.$$.fragment);
    			t3 = space();
    			create_component(surveybar.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(menubar, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(menu, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(defaultmetrics, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(custommetrics, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(surveybar, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "load", /*load*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menubar.$$.fragment, local);
    			transition_in(menu.$$.fragment, local);
    			transition_in(defaultmetrics.$$.fragment, local);
    			transition_in(custommetrics.$$.fragment, local);
    			transition_in(surveybar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menubar.$$.fragment, local);
    			transition_out(menu.$$.fragment, local);
    			transition_out(defaultmetrics.$$.fragment, local);
    			transition_out(custommetrics.$$.fragment, local);
    			transition_out(surveybar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(menubar, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(menu, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(defaultmetrics, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(custommetrics, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(surveybar, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $ms;
    	validate_store(ms, 'ms');
    	component_subscribe($$self, ms, $$value => $$invalidate(1, $ms = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	function loadTemplate() {
    		var _a;

    		set_store_value(
    			ms,
    			$ms.template = JSON.parse((_a = localStorage.getItem("template")) !== null && _a !== void 0
    			? _a
    			: JSON.stringify(exampleTemplate)),
    			$ms
    		);

    		set_store_value(
    			ms,
    			$ms.metrics = $ms.template.metrics.map(metric => {
    				let defaultValue = getMetricDefaultValue(metric.type);
    				if (metric.type == "select") defaultValue = metric.values[0];

    				return Object.assign(Object.assign({}, metric), {
    					value: defaultValue,
    					default: defaultValue
    				});
    			}),
    			$ms
    		);
    	}

    	/** Parses and loads the survey backup from `localStorage` */
    	function loadBackup() {
    		const backup = JSON.parse(localStorage.getItem("backup"));

    		if (backup) {
    			set_store_value(ms, $ms.team = backup.find(metric => metric.name == "Team").value, $ms);
    			set_store_value(ms, $ms.match = backup.find(metric => metric.name == "Match").value, $ms);
    			set_store_value(ms, $ms.isAbsent = backup.find(metric => metric.name == "Absent").value, $ms);
    			$ms.metrics.forEach((metric, i) => metric.value = backup[i + 3].value);
    		}
    	}

    	/** Registers service worker, loads template and backup */
    	function load() {
    		if ("serviceWorker" in navigator) {
    			try {
    				navigator.serviceWorker.register("./sw.js");
    			} catch(e) {
    				console.log(e);
    			}
    		}

    		loadTemplate();
    		loadBackup();
    		document.body.classList.remove("hide");
    	}

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		ms,
    		exampleTemplate,
    		getMetricDefaultValue,
    		MenuBar,
    		Menu,
    		DefaultMetrics,
    		CustomMetrics,
    		SurveyBar,
    		loadTemplate,
    		loadBackup,
    		load,
    		$ms
    	});

    	return [load];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({ target: document.body });

    return app;

})();
//# sourceMappingURL=bundle.js.map
