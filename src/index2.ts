import {
    Plugin,
    showMessage,
    confirm,
    Dialog,
    Menu,
    openTab,
    adaptHotkey,
    getFrontend,
    getBackend,
    IModel,
    Setting,
    Protyle,
    ITab,
    ISearchOption,

} from "siyuan";

// import {marked} from 'marked'


import "@/index.scss";


import * as api from "./api";

// import * as sy from "siyuan";

import HelloExample from "@/hello.svelte";
import SettingPannel from "@/libs/setting-panel.svelte";
// import { children, component_subscribe, missing_component } from "svelte/internal";

const STORAGE_NAME = "menu-config";
const TAB_TYPE = "custom_tab";
const DOCK_TYPE = "dock_tab";


var q导图元素对象 = {
    已经有了: false,
    导图元素: null as HTMLElement,
    按钮框: null as HTMLElement,
    放大: null as HTMLElement,
    缩小: null as HTMLElement,
    画布框: null as HTMLElement,
    画布: null as HTMLElement,
    节点画布: null as HTMLElement,
    连接线画布: null as SVGSVGElement,

}


var q编辑器中当前文档所有元素 :HTMLElement[]

var q当前文档所有块 = []

var q焦点块id: string

var q根块id: string

var q根节点: MindMap

var q焦点节点: MindMap

var 思维导图显示方式 = 0

var q_mindmap元素: HTMLElement


var 判断是否已经有q_mindmap元素 = false

var 放缩比例 = 1






export default class PluginSample extends Plugin {

    // q_mindmap元素: HTMLElement



    private customTab: () => IModel;
    private isMobile: boolean;
    private blockIconEventBindThis = this.blockIconEvent.bind(this);

    async onload() {


        this.data[STORAGE_NAME] = { readonlyText: "Readonly" };



        const frontEnd = getFrontend();

        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";



        // ----------------

        // 添加编辑器单击事件
        this.eventBus.on("click-editorcontent", this.eventBusLog);
        // ---------------------


        // 图标的制作参见帮助文档
        this.addIcons(`<symbol id="iconFace" viewBox="0 0 32 32">
<path d="M13.667 17.333c0 0.92-0.747 1.667-1.667 1.667s-1.667-0.747-1.667-1.667 0.747-1.667 1.667-1.667 1.667 0.747 1.667 1.667zM20 15.667c-0.92 0-1.667 0.747-1.667 1.667s0.747 1.667 1.667 1.667 1.667-0.747 1.667-1.667-0.747-1.667-1.667-1.667zM29.333 16c0 7.36-5.973 13.333-13.333 13.333s-13.333-5.973-13.333-13.333 5.973-13.333 13.333-13.333 13.333 5.973 13.333 13.333zM14.213 5.493c1.867 3.093 5.253 5.173 9.12 5.173 0.613 0 1.213-0.067 1.787-0.16-1.867-3.093-5.253-5.173-9.12-5.173-0.613 0-1.213 0.067-1.787 0.16zM5.893 12.627c2.28-1.293 4.040-3.4 4.88-5.92-2.28 1.293-4.040 3.4-4.88 5.92zM26.667 16c0-1.040-0.16-2.040-0.44-2.987-0.933 0.2-1.893 0.32-2.893 0.32-4.173 0-7.893-1.92-10.347-4.92-1.4 3.413-4.187 6.093-7.653 7.4 0.013 0.053 0 0.12 0 0.187 0 5.88 4.787 10.667 10.667 10.667s10.667-4.787 10.667-10.667z"></path>
</symbol>
<symbol id="iconSaving" viewBox="0 0 32 32">
<path d="M20 13.333c0-0.733 0.6-1.333 1.333-1.333s1.333 0.6 1.333 1.333c0 0.733-0.6 1.333-1.333 1.333s-1.333-0.6-1.333-1.333zM10.667 12h6.667v-2.667h-6.667v2.667zM29.333 10v9.293l-3.76 1.253-2.24 7.453h-7.333v-2.667h-2.667v2.667h-7.333c0 0-3.333-11.28-3.333-15.333s3.28-7.333 7.333-7.333h6.667c1.213-1.613 3.147-2.667 5.333-2.667 1.107 0 2 0.893 2 2 0 0.28-0.053 0.533-0.16 0.773-0.187 0.453-0.347 0.973-0.427 1.533l3.027 3.027h2.893zM26.667 12.667h-1.333l-4.667-4.667c0-0.867 0.12-1.72 0.347-2.547-1.293 0.333-2.347 1.293-2.787 2.547h-8.227c-2.573 0-4.667 2.093-4.667 4.667 0 2.507 1.627 8.867 2.68 12.667h2.653v-2.667h8v2.667h2.68l2.067-6.867 3.253-1.093v-4.707z"></path>
</symbol>`);

        const topBarElement = this.addTopBar({
            icon: "iconFace",
            title: this.i18n.addTopBarIcon,
            position: "right",
            callback: () => {
                if (this.isMobile) {
                    this.addMenu();
                } else {
                    let rect = topBarElement.getBoundingClientRect();
                    // 如果被隐藏，则使用更多按钮
                    if (rect.width === 0) {
                        rect = document.querySelector("#barMore").getBoundingClientRect();
                    }
                    if (rect.width === 0) {
                        rect = document.querySelector("#barPlugins").getBoundingClientRect();
                    }
                    this.addMenu(rect);
                }
            }
        });

        const statusIconTemp = document.createElement("template");
        statusIconTemp.innerHTML = `<div class="toolbar__item b3-tooltips b3-tooltips__w" aria-label="Remove plugin-sample Data">
    <svg>
        <use xlink:href="#iconTrashcan"></use>
    </svg>
</div>`;
        statusIconTemp.content.firstElementChild.addEventListener("click", () => {
            confirm("⚠️", this.i18n.confirmRemove.replace("${name}", this.name), () => {
                this.removeData(STORAGE_NAME).then(() => {
                    this.data[STORAGE_NAME] = { readonlyText: "Readonly" };
                    showMessage(`[${this.name}]: ${this.i18n.removedData}`);
                });
            });
        });
        this.addStatusBar({
            element: statusIconTemp.content.firstElementChild as HTMLElement,
        });

        let tabDiv = document.createElement("div");
        new HelloExample({
            target: tabDiv,
            props: {
                app: this.app,
            }
        });
        this.customTab = this.addTab({
            type: TAB_TYPE,
            init() {
                this.element.appendChild(tabDiv);
                //console.log(this.element);
            },
            beforeDestroy() {
                //console.log("before destroy tab:", TAB_TYPE);
            },
            destroy() {
                //console.log("destroy tab:", TAB_TYPE);
            }
        });




        // 这个是新窗口的代码
        this.addDock({
            config: {
                position: "LeftBottom",
                size: { width: 200, height: 0 },
                icon: "iconSaving",
                title: "Custom Dock",
            },
            data: {
                text: "This is my custom dock"
            },
            type: DOCK_TYPE,
            init() {

                this.element.id = "custom-dock";
                this.element.innerHTML = ''
                //     this.element.innerHTML = ` <div id="muru">
                //     <div id="按钮框">
                //         <div id="放大">放大</div>
                //         <div id="缩小">缩小</div>
                //     </div>
                //     <div id="导图框">
                //         <div id="导图画布">
                //             <div id="mindmap">

                //             </div>
                //         </div>
                //         <svg id="连接线画布">

                //         </svg>

                //     </div>
                // </div>`;




            },
            destroy() {
                //console.log("destroy dock:", DOCK_TYPE);
            }
        });

    }

    onLayoutReady() {
        this.loadData(STORAGE_NAME);
        //console.log(`frontend: ${getFrontend()}; backend: ${getBackend()}`);
    }

    onunload() {

        showMessage("Goodbye SiYuan Plugin");

    }

    /**
     * A custom setting pannel provided by svelte
     */
    openDIYSetting(): void {

        let dialog = new Dialog({
            title: "SettingPannel",
            content: `<div id="SettingPanel"></div>`,
            width: "600px",
            destroyCallback: (options) => {
                //console.log("destroyCallback", options);
                //You'd better destroy the component when the dialog is closed
                pannel.$destroy();
            }
        });
        // //console.log("openDIYSetting",dialog);
        let pannel = new SettingPannel({
            target: dialog.element.querySelector("#SettingPanel"),
        });
        //console.log("pannel", pannel);
    }




    // ---------编辑器点击时执行的函数
    private eventBusLog({ detail }: any) {

        console.log(detail)


        插件总程序(this)

        function 插件总程序(cthis, c焦点块id?) {


            //打印点击的对象
            // 获取点击的块
            // let b = detail.protyle.block.id,
            //     M = detail.protyle.breadcrumb.id;
            // console.log("dockEvent======", b)
            // console.log("dockEvent======", M)




            //   获取目录元素并存放到全局变量中去
            var 导图元素 = document.getElementById('custom-dock');

            if (!导图元素) {

                return;
            }
            if (q导图元素对象.已经有了) {
            } else {
                导图元素.innerHTML = '';
                q导图元素对象.导图元素 = 导图元素


                let 按钮框 = document.createElement('div');
                导图元素.appendChild(按钮框);
                按钮框.id = "按钮框"
                q导图元素对象.按钮框 = 按钮框


                let 放大 = document.createElement('div');
                按钮框.appendChild(放大);
                放大.id = "放大"
                放大.innerText = "放大"
                q导图元素对象.放大 = 放大

                let 缩小 = document.createElement('div');
                按钮框.appendChild(缩小);
                缩小.id = "缩小"
                缩小.innerText = "缩小"
                q导图元素对象.缩小 = 缩小


                let 画布框 = document.createElement('div');
                导图元素.appendChild(画布框);
                画布框.id = "画布框"
                q导图元素对象.画布框 = 画布框

                let 画布 = document.createElement('div');
                画布框.appendChild(画布);
                画布.id = "画布"
                q导图元素对象.画布 = 画布

                // 创建连接线的画布（在个在前面创建，或者后面调整显示层级）
                var 连接线画布 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                画布.appendChild(连接线画布);
                连接线画布.id = '连接线画布'
                q导图元素对象.连接线画布 = 连接线画布



                let 节点画布 = document.createElement('div');
                画布.appendChild(节点画布);
                节点画布.id = "节点画布"
                q导图元素对象.节点画布 = 节点画布





                q导图元素对象.已经有了 = true



            }



            // 获取所有块对应的文档内的元素

            var 编辑器中被选中的内容元素 = 找到编辑器中被选中的内容元素(detail)



            // 查找子元素
            const children = 编辑器中被选中的内容元素.querySelectorAll('*');

            // 过滤有指定属性的元素
            q编辑器中当前文档所有元素 = [];

            children.forEach(child => {
                if (child.getAttribute('data-node-id')) {
                    q编辑器中当前文档所有元素.push(child);
                }
            });



            // 创建焦点id和根节点id


            q根块id = detail.protyle.block.rootID

            if (c焦点块id) {
                q焦点块id = c焦点块id

            } else {
                q焦点块id = 获取焦点块id(detail)

            }
            if (!q焦点块id) {
                q焦点块id = q根块id
            }







            // 跳入下一个程序循环
            异步函数(cthis)


            // ------------------------------






            async function 异步函数(cthis) {



                // 获得所有块
                q当前文档所有块 = []
                let sqlScript = `select * from blocks where root_id
                ='${q根块id}' LIMIT -1`;
                q当前文档所有块 = await api.sql(sqlScript);
                // console.log("sql", 当前文档所有块)


                // 创建根节点

                var j根节点 = new MindMap()

                j根节点.isroot = true
                j根节点.nodeid = q根块id
                j根节点.type = "root"
                j根节点.顺序 = -1
                q根节点 = j根节点





                // 设置根节点和焦点节点

                生成导图数据(cthis)

                // var { a, b } = 生成导图数据(cthis)

                // q根节点 = a
                // q焦点节点 = b

                console.log("根节点", q根节点)
                console.log("焦点节点", q焦点节点)



                转换i类型的文本(cthis)

                设置显示属性(cthis, q焦点节点)

                画节点图(cthis)


                function 生成导图数据(cthis) {

                    // var 当前文档所有元素 = q编辑器中当前文档所有元素
                    // var 根节点 = q根节点
                    // var 当前文档所有块 = q当前文档所有块
                    // var 焦点块id = q焦点块id



                    var 节点数组: Array<MindMap> = []

                    节点数组.push(q根节点)


                    // var 焦点节点: MindMap


                    // 创建节点，设置节点（node，nodeid，type，neirong）

                    for (var i = 0; i < q当前文档所有块.length; i++) {
                        var 块 = q当前文档所有块[i]
                        var 节点1 = new MindMap()
                        节点1.node = 块
                        节点1.nodeid = 块.id
                        节点1.type = 块.type

                        // 设置顺序
                        var 顺序 = q编辑器中当前文档所有元素.findIndex(item => item.dataset.nodeId == 块.id);
                        if (顺序) {
                            节点1.顺序 = 顺序
                        } else { 节点1.顺序 = -1 }


                        // 节点设置内容
                        if (节点1.type == "l") {
                        } else if (块.type == "t") {
                            节点1.neirong = 块.markdown
                        } else if (块.type == "i") {
                            节点1.neirong = 块.fcontent
                        } else {
                            节点1.neirong = 块.content
                        }


                        //设置焦点节点

                        if (块.id == q焦点块id) {
                            节点1.is焦点 = true
                            q焦点节点 = 节点1
                        }
                        节点数组.push(节点1)
                    }



                    //添加父子关系
                    for (var i = 0; i < 节点数组.length; i++) {

                        var 节点2 = 节点数组[i]
                        if (节点2.node) {
                            var 父节点 = 节点数组.find(isParentNode);
                        }
                        // console.log("节点2",节点2)
                        function isParentNode(el) {

                            return el.nodeid == 节点2.node.parent_id;
                        }
                        if (父节点) {
                            // console.log(父节点)
                            节点2.parent = 父节点
                            父节点.children.push(节点2)
                        }

                    }


                    修改兄弟节点的顺序(q根节点)
                    // 修改兄弟节点的顺序
                    function 修改兄弟节点的顺序(节点) {

                        if (节点.children) {
                            // for ()
                            节点.children.sort(function (a, b) {
                                return a.顺序 - b.顺序;
                            });

                            for (var i = 0; i < 节点.children.length; i++) {
                                修改兄弟节点的顺序(节点.children[i])
                            }

                        }

                    }

                    // return {
                    //     a: 根节点,
                    //     b: 焦点节点
                    // };

                }




                function 转换i类型的文本(cthis) {

                    // var 根节点 = c根节点
                    循环(q根节点)

                    function 循环(节点: MindMap) {

                        if (节点.type == "i") {
                            if (节点.children.length > 0) {
                                for (let i = 0; i < 节点.children.length; i++) {
                                    var 子节点 = 节点.children[i]
                                    if (子节点.node.content == 节点.node.fcontent) {
                                        子节点.is被引用 = true
                                        子节点.被引用 = 节点
                                        节点.is焦点 = 子节点.is焦点
                                        节点.is跳转 = true
                                        节点.跳转 = 子节点
                                    }
                                }

                            }
                        }

                        if (节点.children) {
                            for (let i = 0; i < 节点.children.length; i++) {


                                循环(节点.children[i])
                            }

                        }


                    }






                }

                function 设置显示属性(cthis, c焦点节点: MindMap) {
                    c焦点节点.isdisplay = true

                    if (c焦点节点.is被引用) {
                        var 焦点节点 = c焦点节点.被引用


                    } else {
                        var 焦点节点 = c焦点节点
                    }



                    设置子节点显示属性(焦点节点)

                    // 设置子节点显示属性
                    function 设置子节点显示属性(节点) {

                        if (节点.children) {
                            for (var i = 0; i < 节点.children.length; i++) {
                                var 子节点 = 节点.children[i]
                                子节点.isdisplay = true
                                if (思维导图显示方式 == 0) {
                                    if (子节点.type == "l") {
                                        l节点设置显示属性(子节点)

                                    }

                                } else {
                                    设置子节点显示属性(子节点)
                                }

                            }
                        }
                    }





                    // 设置兄弟节点的属性
                    设置兄弟节点的显示属性(焦点节点)

                    function 设置兄弟节点的显示属性(c当前节点) {


                        if (c当前节点.parent) {

                            var 父节点 = c当前节点.parent
                            父节点.isdisplay = true
                            if (父节点.children) {
                                for (var i = 0; i < 父节点.children.length; i++) {
                                    父节点.children[i].isdisplay = true
                                    var 兄弟节点 = 父节点.children[i]
                                    if (兄弟节点.type == "l") {
                                        l节点设置显示属性(兄弟节点)

                                    }
                                }
                            }

                            设置兄弟节点的显示属性(父节点)

                        }


                    }



                    function l节点设置显示属性(c节点: MindMap) {

                        var 节点 = c节点
                        节点.isdisplay = true
                        if (节点.children) {

                            for (var i = 0; i < 节点.children.length; i++) {
                                var 子节点 = 节点.children[i]

                                子节点.isdisplay = true

                            }
                        }

                    }

                }






                function 画节点图(cthis) {


                    var 节点画布 = q导图元素对象.节点画布
                    var 画布 = q导图元素对象.画布
                    var 放大 = q导图元素对象.放大
                    var 缩小 = q导图元素对象.缩小
                    var 连接线画布 = q导图元素对象.连接线画布


                    var 导图中焦点元素: HTMLElement

                    // 添加鼠标事件
                    // if (!判断是否已经有q_mindmap元素) {

                    移动(画布)

                    缩放(放大, 缩小, 画布)

                    // }
                    //    画出思维导图的每个节点
                    // 清空画布
                    节点画布.innerHTML = ""

                    // 清除svg
                    while (连接线画布.firstChild) {
                        连接线画布.removeChild(连接线画布.firstChild);
                    }

                    循环画节点图(q根节点, 节点画布)



                    // 超出后移动到中点
                    if (导图中焦点元素) {



                        // var 外部定位框 = document.getElementById("custom-dock").parentElement
                        // console.log('外部定位框', 外部定位框)
                        var 画布框尺寸信息 = q导图元素对象.画布框.getBoundingClientRect()
                  




                        // var 导图框元素 = document.getElementById("导图框")
                        var 画布尺寸信息 = q导图元素对象.画布.getBoundingClientRect()
                        // console.log('导图框', 导图框元素.getBoundingClientRect())


                        var 焦点尺寸信息 = 导图中焦点元素.getBoundingClientRect()

                        // console.log('画布框尺寸信息', 画布框尺寸信息)
                        // console.log('焦点尺寸信息', 焦点尺寸信息)




                        var 画布框中点 = {
                            x: 画布框尺寸信息.left + 画布框尺寸信息.width / 2,
                            y: 画布框尺寸信息.top + 画布框尺寸信息.height / 2
                        }

                        var 焦点中点 = {
                            x: 焦点尺寸信息.left + 焦点尺寸信息.width / 2,
                            y: 焦点尺寸信息.top + 焦点尺寸信息.height / 2
                        }



                        var 焦点与画布框中点位置距离 = {
                            x: 焦点中点.x - 画布框中点.x,
                            y: 焦点中点.y - 画布框中点.y
                        }



                        if (焦点尺寸信息.top < 画布框尺寸信息.top || 焦点尺寸信息.bottom > 画布框尺寸信息.bottom || 焦点尺寸信息.left < 画布框尺寸信息.left || 焦点尺寸信息.right > 画布框尺寸信息.right) {

                            // getBoundingClientRect()时相对页面的位置
                            // Style.left是相对父元素的left




                            画布.style.left = (画布尺寸信息.left - 画布框尺寸信息.left - 焦点与画布框中点位置距离.x) + 'px'

                            画布.style.top = (画布尺寸信息.top - 画布框尺寸信息.top - 焦点与画布框中点位置距离.y) + 'px'


                        }

                    }



                    循环画连线图(q根节点)







                    function 循环画节点图(当前节点: MindMap, 元素: HTMLElement,) {


                        var 传递下一步的子元素 = 元素



                        // 忽略掉isdisplay不显示的，被引用的
                        if (当前节点.isdisplay && !当前节点.is被引用) {

                            // 忽略掉l节点
                            if (当前节点.type != "l") {

                                //------------------------
                                let 节点元素 = document.createElement('div');
                                节点元素.classList.add("节点元素");
                                元素.appendChild(节点元素);
                                节点元素.classList.add(当前节点.type);


                                // --------------------
                                let 文本元素 = document.createElement('div');
                                文本元素.classList.add("文本元素");
                                文本元素.classList.add(当前节点.type);
                                节点元素.appendChild(文本元素);





                                let 文本显示元素 = document.createElement('div');
                                文本显示元素.classList.add(当前节点.type);
                                文本显示元素.classList.add("文本显示元素");




                                文本元素.appendChild(文本显示元素);



                                // 元素标记是否有子块
                                if (当前节点.children.length > 1) {
                                    文本元素.classList.add("有子节点")



                                } else if (当前节点.type != "i" && 当前节点.children.length == 1) {

                                    文本元素.classList.add("有子节点")
                                }


                                //------------------------

                                let 子节点元素 = document.createElement('div');
                                子节点元素.classList.add("子节点元素");
                                节点元素.appendChild(子节点元素);



                                // 将元素nodeid添加到导图元素中去

                                if (当前节点.is跳转) {

                                    节点元素.setAttribute("node_id", 当前节点.跳转.nodeid)
                                    文本元素.setAttribute("node_id", 当前节点.跳转.nodeid)
                                    文本显示元素.setAttribute("node_id", 当前节点.跳转.nodeid)
                                    子节点元素.setAttribute("node_id", 当前节点.跳转.nodeid)
                                } else {
                                    // 文本显示元素.setAttribute("node_id", 当前节点.nodeid)

                                    节点元素.setAttribute("node_id", 当前节点.nodeid)
                                    文本元素.setAttribute("node_id", 当前节点.nodeid)
                                    文本显示元素.setAttribute("node_id", 当前节点.nodeid)
                                    子节点元素.setAttribute("node_id", 当前节点.nodeid)
                                }



                                // 添加导图元素的内容
                                if (当前节点.is被引用) {

                                } else {
                                    // 文本显示元素.innerText = 当前节点.neirong

                                    if (当前节点.is跳转) {

                                        var index = q编辑器中当前文档所有元素.findIndex(item => item.getAttribute('data-node-id') === 当前节点.跳转.nodeid);
                              
                                    }else {

                                        var index = q编辑器中当前文档所有元素.findIndex(item => item.getAttribute('data-node-id') === 当前节点.nodeid);
                              
                                   

                                    }
                                 
                                    if(index!=-1){
                                        文本显示元素.appendChild(q编辑器中当前文档所有元素[index].cloneNode(true))
                                    }

                                    if (当前节点.is焦点) {
                                        文本显示元素.classList.add("导图中焦点元素")
                                        导图中焦点元素 = 文本显示元素
                                    }
                                }


                                //导图元素添加单击事件

                                文本显示元素.onclick = function () {
                                    // console.log("单击----", this)


                                    var id = 文本显示元素.getAttribute('node_id')
                                    // console.log("id", id)
                                    设置焦点块(id)

                                    插件总程序(cthis, id)

                                    // 画节点图3(根节点, 焦点节点, 目录div)
                                }


                                传递下一步的子元素 = 子节点元素


                                // console.log('传递下一步的上一级元素', 传递下一步的上一级元素)
                            }


                            if (当前节点.children) {

                                for (let i = 0; i < 当前节点.children.length; i++) {
                                    循环画节点图(当前节点.children[i], 传递下一步的子元素)
                                }
                            }
                        }
                        function 设置焦点块(nodeId: string) {

                           
                            var index = q编辑器中当前文档所有元素.findIndex(item => item.getAttribute('data-node-id') === nodeId);

                            var element=q编辑器中当前文档所有元素[index]
                            // const element = document.querySelector(`[data-node-id="${nodeId}"]`) as HTMLElement;

                            if (element) {

                                element.scrollIntoView({
                                    behavior: "smooth",
                                    inline: "center",
                                    block: "center"
                                })



                                const selection = window.getSelection();
                                const range = document.createRange();
                                range.selectNodeContents(element);

                                selection.removeAllRanges();
                                selection.addRange(range);

                            }

                        }
                    }



                    function 循环画连线图(当前节点: MindMap, 元素?: HTMLElement) {
                     



                        var 传递下一步的子元素 = 元素



                        //获取子节点和子节点的位置，通过节点nodeid获得元素，再获得元素位置
                        if (当前节点.isdisplay && !当前节点.is被引用) {

                            // 忽略掉l节点
                            if (当前节点.type != "l") {

                                if (当前节点.is跳转) {

                                    var id = 当前节点.跳转.nodeid

                                } else {

                                    var id = 当前节点.nodeid

                                }


                                // 获取所有nodeid为当前节点id的元素
                                const nodeContainers = q导图元素对象.画布.querySelectorAll(`[node_id="${id}"]`);
                                const 所有nodeid数组 = Array.from(nodeContainers);

                                // var id = 当前节点.nodeid


                                // 在数组中找到”文本显示元素“元素
                                const index1 = 所有nodeid数组.findIndex(item => item.classList.

                                    contains('文本显示元素'));

                                var 终点元素 = 所有nodeid数组[index1]



                                // 在数组中找到”子节点元素“元素
                                const index2 = 所有nodeid数组.findIndex(item => item.classList.

                                    contains('子节点元素'));

                                var 子节点元素 = 所有nodeid数组[index2]



                                传递下一步的子元素 = 子节点元素 as HTMLElement






                                //如果有起点
                                if (元素) {
                                    var 连接线画布尺寸 = q导图元素对象.连接线画布.getBoundingClientRect()


                                    var 起点元素 = 元素
                                    // Get the p elements
                                    const p1 = 起点元素
                                    const p2 = 终点元素


                                    if (p1 && p2 && p1.id != "连接线画布") {



                                        const p1Rect = p1.getBoundingClientRect();
                                        const p2Rect = p2.getBoundingClientRect();


                                        const startX = (p1Rect.x - 连接线画布尺寸.x) / 放缩比例
                                        const startY = (p1Rect.y + p1Rect.height / 2 - 连接线画布尺寸.y) / 放缩比例


                                        const endX = (p2Rect.x - 连接线画布尺寸.x) / 放缩比例
                                        const endY = (p2Rect.y + p2Rect.height / 2 - 连接线画布尺寸.y) / 放缩比例


                                        // Draw SVG line
                                        const svg = 连接线画布
                                        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                                        path.classList.add('连接线')

                                        path.setAttribute('d', `M${startX} ${startY} C ${startX} ${(startY + endY) / 2} ${endX} ${(startY + endY) / 2} ${endX} ${endY}`);

                                        path.setAttribute('d', `M${startX} ${startY} C ${(startX + endX) / 2} ${startY} ${(startX + endX) / 2} ${endY}  ${endX} ${endY}`);


                                        path.setAttribute('stroke', '#b4b2b3');
                                        path.setAttribute('fill', 'none');

                                        svg.appendChild(path);

                                    }


                                }



                            }

                            // console.log('传递下一步的子元素', 传递下一步的子元素)
                            if (当前节点.children) {
                                for (let i = 0; i < 当前节点.children.length; i++) {
                                    循环画连线图(当前节点.children[i], 传递下一步的子元素)
                                }
                            }

                        }
                    }


                    function 移动(el: HTMLElement) {//待改善
                        // console.log('hehe-----')
                        // 获取元素节点
                        let moveElement = el

                        // 给元素注册鼠标按下事件
                        moveElement.onmousedown = function (e) {
                            var 画布位置 = moveElement.getBoundingClientRect()
                            // console.log('画布位置', 画布位置)

                            var dakuang = document.getElementById("画布框")

                            var dakuang的位置 = dakuang.getBoundingClientRect()
                            // console.log('dakuang的位置', dakuang的位置)


                            // console.log(moveElement.getAttribute)
                            let yuan_x = Number(moveElement.style.left.slice(0, -2))
                            let yuan_y = Number(moveElement.style.top.slice(0, -2))
                            let originalStyle = moveElement.getAttribute('style');
                            // console.log('yuan_x,yuan_y', yuan_x, yuan_y)
                            // 获取鼠标按下去的那一个点距离边框顶部和左侧的距离

                            let point_x = event.clientX;
                            let point_y = event.clientY;
                            // console.log("point_x,point_y", point_x, point_y)
                            //  鼠标移动(小方块在文档上移动，给文档注册一个是移动事件)
                            document.onmousemove = function (ent) {
                                let evt = ent || window.event;
                                // console.log(evt)
                                // 获取鼠标移动的坐标位置
                                let ele_left = evt.clientX - point_x;
                                let ele_top = evt.clientY - point_y;

                                // 优化为下面的
                                var dx = yuan_x + ele_left
                                var dy = yuan_y + ele_top
                                // console.log("dx,dy", dx, dy)
                                ele_left = Math.min(Math.max(0, ele_left), window.innerWidth - moveElement.offsetWidth)
                                ele_top = Math.min(Math.max(0, ele_top), window.innerHeight - moveElement.offsetHeight)
                                // moveElement.setAttribute('style', 'left:' + dx + 'px;top:' + dy + 'px;');

                                moveElement.setAttribute('style', originalStyle + 'left:' + dx + 'px;top:' + dy + 'px;');
                                // moveElement.style.left = (yuan_x + ele_left) + 'px';
                                // moveElement.style.top = (yuan_y + ele_top) + 'px'
                            }

                            // 抬起停止移动
                            document.onmouseup = function (event) {
                                // console.log("抬起停止移动")
                                // 移除移动和抬起事件
                                this.onmouseup = null;
                                this.onmousemove = null;
                                //修复低版本的ie可能出现的bug
                                // if (typeof moveElement.releaseCapture != 'undefined') {
                                // 	moveElement.releaseCapture();
                                // }
                            }
                            // 解决有些时候,在鼠标松开的时候,元素仍然可以拖动-使用的是第二种方式
                            document.ondragstart = function (ev) {
                                ev.preventDefault();
                            }
                            document.ondragend = function (ev) {
                                ev.preventDefault();
                            }
                        }
                    }


                    function 缩放(放大: HTMLElement, 缩小: HTMLElement, el: HTMLElement) {
                        const element = el

                        const yuanrect = element.getBoundingClientRect();
                        var yidongxjuli = yuanrect.width * 0.1 / 2;
                        var yidongyjuli = yuanrect.height * 0.1 / 2;

                        // 初始化缩放比例变量
                        // let scale = 1;
                        放大.addEventListener('click', () => {
                            放缩比例 += 0.1;
                            // 放缩比例 = scale
                            var cishu = Math.floor((放缩比例 - 1) / 0.1)
                            var zuo = yidongxjuli * cishu
                            var shang = yidongyjuli * cishu
                            element.style.transform = `translate(${zuo}px, ${shang}px)scale(${放缩比例})`;
                        });
                        缩小.addEventListener('click', () => {
                            放缩比例 -= 0.1;
                            // 放缩比例 = scale
                            var cishu = Math.floor((放缩比例 - 1) / 0.1)
                            var zuo = yidongxjuli * cishu
                            var shang = yidongyjuli * cishu
                            element.style.transform = `translate(${zuo}px, ${shang}px)scale(${放缩比例})`;
                        });

                    }




                }



            }








            function 获取焦点块id(detail) {
                var 元素 = detail.event.srcElement;
                var 焦点块id2: string
                循环(元素)
                function 循环(元素) {
                    if (元素.hasAttribute("data-node-id")) {
                        焦点块id2 = 元素.getAttribute("data-node-id");
                    } else {
                        循环(元素.parentElement)

                    }
                }

                return 焦点块id2;
            }


            function 找到编辑器中被选中的内容元素(detail) {
                var 被选中的元素 = detail.protyle.element


                // var 编辑器中被选中的内容元素: HTMLElement
                循环(被选中的元素)

                function 循环(元素) {
                    if (!编辑器中被选中的内容元素) {
                        // console.log("元素", 元素)
                        if (元素.hasAttribute("data-doc-type")) {

                            编辑器中被选中的内容元素 = 元素
                        } else {
                            if (元素.children.length > 0) {
                                for (var i = 0; i < 元素.children.length; i++) {
                                    循环(元素.children[i])
                                }
                            }
                        }
                    }
                }
                if (编辑器中被选中的内容元素) {
                    return 编辑器中被选中的内容元素
                }
            }



        }


    }



    // 顶部框
    private blockIconEvent({ detail }: any) {
        const ids: string[] = [];
        detail.blockElements.forEach((item: HTMLElement) => {
            ids.push(item.getAttribute("data-node-id"));
        });
        detail.menu.addItem({
            iconHTML: "",
            type: "readonly",
            label: "IDs<br>" + ids.join("<br>"),
        });
    }



    //顶部框添加项目
    private addMenu(rect?: DOMRect) {
        const menu = new Menu("topBarSample", () => {

        });

        if (!this.isMobile) {
            menu.addItem({
                icon: "iconLayoutBottom",
                label: "切换导图显示方式",
                click: () => {
                    // const tab = openTab({
                    //     app: this.app,
                    //     custom: {
                    //         icon: "iconFace",
                    //         title: "Custom Tab",
                    //         data: {
                    //             text: "This is my custom tab",
                    //         },
                    //         fn: this.customTab
                    //     },
                    // });
                    if (思维导图显示方式 == 0) {
                        思维导图显示方式 = -1
                    } else {
                        思维导图显示方式 = 0
                    }
                    // console.log("思维导图显示方式", 思维导图显示方式)


                    //console.log(tab);
                }
            });

        }

        if (this.isMobile) {
            menu.fullscreen();
        } else {
            menu.open({
                x: rect.right,
                y: rect.bottom,
                isLeft: true,
            });
        }
    }
}

// 创建一个mindmap类，包含属性nodeid,text,children,parent,level,index,isOpen,isSelected,isLeaf,isRoot,isLast,isFirst,isFirstChild,
// 以及方法addNode,removeNode,addChild,removeChild,moveNode,moveNodeTo,moveNodeToRoot,moveNodeToParent
class MindMap {

    node: Block;
    children: MindMap[];
    parent: MindMap;
    isroot: boolean;
    nodeid: string;
    el: any[];
    isdisplay: boolean;
    type: string;
    neirong: string;
    is显示线路上: boolean;
    is焦点: boolean;
    is跳转: boolean;
    跳转: MindMap;
    is被引用: boolean;
    被引用: MindMap;
    顺序: number;






    // 设置chil dren为空数组，isroot为true，parent为空
    constructor() {
        // this.block = null;
        this.children = [];
        this.parent = null;
        this.isroot = false;
        this.el = [];
        this.isdisplay = false;
        this.is显示线路上 = false;
        this.is焦点 = false;
        this.is跳转 = false;
        this.is被引用 = false;
        this.neirong = ""

    }
}
