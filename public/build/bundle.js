
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
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
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
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
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
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.3' }, detail), true));
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

    /* src/Button.svelte generated by Svelte v3.44.3 */
    const file$1 = "src/Button.svelte";

    function create_fragment$1(ctx) {
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "class", "svelte-14tmd04");
    			add_location(button, file$1, 9, 0, 233);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*toggle*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, ['default']);
    	const dispatch = createEventDispatcher();

    	function toggle() {
    		window.document.body.classList.toggle('dark-mode');
    		dispatch('submit');
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ createEventDispatcher, dispatch, toggle });
    	return [toggle, $$scope, slots];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.44.3 */
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (36:1) { #each Array(21) as _, i }
    function create_each_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "box svelte-w46mlp");
    			set_style(div, "--left", /*lefts*/ ctx[2][/*i*/ ctx[12]]);
    			set_style(div, "--color", /*colors*/ ctx[6][/*i*/ ctx[12]]);
    			set_style(div, "--duration", /*durations*/ ctx[3][/*i*/ ctx[12]]);
    			set_style(div, "--delay", /*delays*/ ctx[5][/*i*/ ctx[12]]);
    			set_style(div, "--size", /*sizes*/ ctx[4][/*i*/ ctx[12]]);
    			add_location(div, file, 36, 2, 768);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(36:1) { #each Array(21) as _, i }",
    		ctx
    	});

    	return block;
    }

    // (44:3) {:else }
    function create_else_block_1(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			i.textContent = "nightlight";
    			attr_dev(i, "class", "material-icons svelte-w46mlp");
    			add_location(i, file, 44, 4, 1084);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(44:3) {:else }",
    		ctx
    	});

    	return block;
    }

    // (42:3) {#if dark }
    function create_if_block_1(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			i.textContent = "light_mode";
    			attr_dev(i, "class", "material-icons svelte-w46mlp");
    			add_location(i, file, 42, 4, 1027);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(42:3) {#if dark }",
    		ctx
    	});

    	return block;
    }

    // (41:2) <Button bind:value={dark} on:submit={handleSubmit}>
    function create_default_slot_1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*dark*/ ctx[0]) return create_if_block_1;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(41:2) <Button bind:value={dark} on:submit={handleSubmit}>",
    		ctx
    	});

    	return block;
    }

    // (62:5) {:else }
    function create_else_block(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			i.textContent = "nightlight";
    			attr_dev(i, "class", "material-icons svelte-w46mlp");
    			add_location(i, file, 62, 6, 1576);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(62:5) {:else }",
    		ctx
    	});

    	return block;
    }

    // (60:5) {#if dark }
    function create_if_block(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			i.textContent = "light_mode";
    			attr_dev(i, "class", "material-icons svelte-w46mlp");
    			add_location(i, file, 60, 6, 1515);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(60:5) {#if dark }",
    		ctx
    	});

    	return block;
    }

    // (59:4) <Button bind:value={dark} on:submit={handleSubmit}>
    function create_default_slot(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*dark*/ ctx[0]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type_1(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(59:4) <Button bind:value={dark} on:submit={handleSubmit}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let link;
    	let t0;
    	let main;
    	let t1;
    	let div0;
    	let button0;
    	let updating_value;
    	let t2;
    	let div2;
    	let div1;
    	let h1;
    	let t4;
    	let p;
    	let t6;
    	let div6;
    	let div3;
    	let t8;
    	let div5;
    	let div4;
    	let button1;
    	let updating_value_1;
    	let t9;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t10;
    	let a1;
    	let img1;
    	let img1_src_value;
    	let t11;
    	let a2;
    	let img2;
    	let img2_src_value;
    	let t12;
    	let a3;
    	let img3;
    	let img3_src_value;
    	let t13;
    	let a4;
    	let img4;
    	let img4_src_value;
    	let current;
    	let each_value = Array(21);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	function button0_value_binding(value) {
    		/*button0_value_binding*/ ctx[7](value);
    	}

    	let button0_props = {
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	};

    	if (/*dark*/ ctx[0] !== void 0) {
    		button0_props.value = /*dark*/ ctx[0];
    	}

    	button0 = new Button({ props: button0_props, $$inline: true });
    	binding_callbacks.push(() => bind(button0, 'value', button0_value_binding));
    	button0.$on("submit", /*handleSubmit*/ ctx[1]);

    	function button1_value_binding(value) {
    		/*button1_value_binding*/ ctx[8](value);
    	}

    	let button1_props = {
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	if (/*dark*/ ctx[0] !== void 0) {
    		button1_props.value = /*dark*/ ctx[0];
    	}

    	button1 = new Button({ props: button1_props, $$inline: true });
    	binding_callbacks.push(() => bind(button1, 'value', button1_value_binding));
    	button1.$on("submit", /*handleSubmit*/ ctx[1]);

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			main = element("main");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			div0 = element("div");
    			create_component(button0.$$.fragment);
    			t2 = space();
    			div2 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "\"Website comming soon\"";
    			t4 = space();
    			p = element("p");
    			p.textContent = "~ Tim Rekelj, 2022";
    			t6 = space();
    			div6 = element("div");
    			div3 = element("div");
    			div3.textContent = "\"Bears, beets, battlestar galactica\"";
    			t8 = space();
    			div5 = element("div");
    			div4 = element("div");
    			create_component(button1.$$.fragment);
    			t9 = space();
    			a0 = element("a");
    			img0 = element("img");
    			t10 = space();
    			a1 = element("a");
    			img1 = element("img");
    			t11 = space();
    			a2 = element("a");
    			img2 = element("img");
    			t12 = space();
    			a3 = element("a");
    			img3 = element("img");
    			t13 = space();
    			a4 = element("a");
    			img4 = element("img");
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "https://fonts.googleapis.com/icon?family=Material+Icons");
    			add_location(link, file, 30, 1, 626);
    			attr_dev(div0, "class", "toggle-darkmode svelte-w46mlp");
    			add_location(div0, file, 39, 1, 924);
    			attr_dev(h1, "class", "svelte-w46mlp");
    			add_location(h1, file, 50, 3, 1210);
    			attr_dev(p, "class", "svelte-w46mlp");
    			add_location(p, file, 51, 3, 1245);
    			attr_dev(div1, "class", "center-help svelte-w46mlp");
    			add_location(div1, file, 49, 2, 1181);
    			attr_dev(div2, "class", "title-box svelte-w46mlp");
    			add_location(div2, file, 48, 1, 1155);
    			attr_dev(div3, "class", "quote svelte-w46mlp");
    			add_location(div3, file, 55, 2, 1312);
    			attr_dev(div4, "class", "mobile-toggle-darkmode svelte-w46mlp");
    			add_location(div4, file, 57, 3, 1399);
    			if (!src_url_equal(img0.src, img0_src_value = "icons/github.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "github");
    			attr_dev(img0, "height", "50px");
    			attr_dev(img0, "class", "svelte-w46mlp");
    			add_location(img0, file, 66, 42, 1694);
    			attr_dev(a0, "href", "https://github.com/timrekelj");
    			add_location(a0, file, 66, 3, 1655);
    			if (!src_url_equal(img1.src, img1_src_value = "icons/instagram.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "instagram");
    			attr_dev(img1, "height", "50px");
    			attr_dev(img1, "class", "svelte-w46mlp");
    			add_location(img1, file, 67, 50, 1804);
    			attr_dev(a1, "href", "https://www.instagram.com/timrekelj/");
    			add_location(a1, file, 67, 3, 1757);
    			if (!src_url_equal(img2.src, img2_src_value = "icons/twitter.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "twitter");
    			attr_dev(img2, "height", "50px");
    			attr_dev(img2, "class", "svelte-w46mlp");
    			add_location(img2, file, 68, 43, 1913);
    			attr_dev(a2, "href", "https://twitter.com/timrekelj");
    			add_location(a2, file, 68, 3, 1873);
    			if (!src_url_equal(img3.src, img3_src_value = "icons/spotify.svg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "spotify");
    			attr_dev(img3, "height", "50px");
    			attr_dev(img3, "class", "svelte-w46mlp");
    			add_location(img3, file, 69, 89, 2064);
    			attr_dev(a3, "href", "https://open.spotify.com/user/9nksd7kzg4meppj2r4kg6cldg?si=fce19c5d8fb34c31");
    			add_location(a3, file, 69, 3, 1978);
    			if (!src_url_equal(img4.src, img4_src_value = "icons/buymecoffee.svg")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "buy me coffee");
    			attr_dev(img4, "height", "50px");
    			attr_dev(img4, "class", "svelte-w46mlp");
    			add_location(img4, file, 70, 52, 2178);
    			attr_dev(a4, "href", "https://www.buymeacoffee.com/timrekelj");
    			add_location(a4, file, 70, 3, 2129);
    			attr_dev(div5, "class", "icons svelte-w46mlp");
    			add_location(div5, file, 56, 2, 1376);
    			attr_dev(div6, "class", "footer svelte-w46mlp");
    			add_location(div6, file, 54, 1, 1289);
    			attr_dev(main, "class", "svelte-w46mlp");
    			add_location(main, file, 33, 0, 729);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(main, null);
    			}

    			append_dev(main, t1);
    			append_dev(main, div0);
    			mount_component(button0, div0, null);
    			append_dev(main, t2);
    			append_dev(main, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t4);
    			append_dev(div1, p);
    			append_dev(main, t6);
    			append_dev(main, div6);
    			append_dev(div6, div3);
    			append_dev(div6, t8);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			mount_component(button1, div4, null);
    			append_dev(div5, t9);
    			append_dev(div5, a0);
    			append_dev(a0, img0);
    			append_dev(div5, t10);
    			append_dev(div5, a1);
    			append_dev(a1, img1);
    			append_dev(div5, t11);
    			append_dev(div5, a2);
    			append_dev(a2, img2);
    			append_dev(div5, t12);
    			append_dev(div5, a3);
    			append_dev(a3, img3);
    			append_dev(div5, t13);
    			append_dev(div5, a4);
    			append_dev(a4, img4);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*lefts, colors, durations, delays, sizes*/ 124) {
    				each_value = Array(21);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(main, t1);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			const button0_changes = {};

    			if (dirty & /*$$scope, dark*/ 8193) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*dark*/ 1) {
    				updating_value = true;
    				button0_changes.value = /*dark*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope, dark*/ 8193) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_1 && dirty & /*dark*/ 1) {
    				updating_value_1 = true;
    				button1_changes.value = /*dark*/ ctx[0];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			destroy_component(button0);
    			destroy_component(button1);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let dark = false;

    	function handleSubmit() {
    		$$invalidate(0, dark = !dark);
    	}

    	let lefts = [];
    	let durations = [];
    	let sizes = [];
    	let delays = [];
    	let colors = [];
    	let available_colors = ['#2D7DD2', '#97CC04', '#ECB0E1', '#F95738'];

    	for (let i = 0; i < 22; i++) {
    		lefts.push(Math.floor(Math.random() * screen.width) + 'px');
    		sizes.push(Math.floor(Math.random() * 100 + 50) + 'px');
    		durations.push(Math.random() * 2 + 2 + 's');
    		delays.push(Math.random() * 2 + 's');
    		colors.push(available_colors[Math.floor(Math.random() * 4)]);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function button0_value_binding(value) {
    		dark = value;
    		$$invalidate(0, dark);
    	}

    	function button1_value_binding(value) {
    		dark = value;
    		$$invalidate(0, dark);
    	}

    	$$self.$capture_state = () => ({
    		Button,
    		dark,
    		handleSubmit,
    		lefts,
    		durations,
    		sizes,
    		delays,
    		colors,
    		available_colors
    	});

    	$$self.$inject_state = $$props => {
    		if ('dark' in $$props) $$invalidate(0, dark = $$props.dark);
    		if ('lefts' in $$props) $$invalidate(2, lefts = $$props.lefts);
    		if ('durations' in $$props) $$invalidate(3, durations = $$props.durations);
    		if ('sizes' in $$props) $$invalidate(4, sizes = $$props.sizes);
    		if ('delays' in $$props) $$invalidate(5, delays = $$props.delays);
    		if ('colors' in $$props) $$invalidate(6, colors = $$props.colors);
    		if ('available_colors' in $$props) available_colors = $$props.available_colors;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		dark,
    		handleSubmit,
    		lefts,
    		durations,
    		sizes,
    		delays,
    		colors,
    		button0_value_binding,
    		button1_value_binding
    	];
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

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
