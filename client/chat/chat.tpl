<pele-screen enter-delay="0">
    <fa-header-footer-layout fa-options="{headerSize:main.viewSize.navbarHeight, footerSize : main.viewSize.tabbarHeight}">
        <!-- HEADER -->
        <fa-modifier>
            <pe-navbar>
                <!-- LEFT BUTTON -->
                <div class="pe-navbar-button left" ng-click="chat.goBack()">
                    <i class="icon ion-chevron-left"></i>
                    Back
                </div>
                <!-- TITLE -->
                <div class="pe-navbar-title">
                    Hadar Landao
                </div>

                <!-- RIGHT -->
                <div class="pe-navbar-button right">
                </div>

            </pe-navbar>
        </fa-modifier>

        <!-- CONTENT -->
        <fa-modifier>
            <!--<fa-render-node fa-node="chat.layout"></fa-render-node>-->
            <fa-container-surface fa-options="{properties : {overflow : 'hidden'}}" >
                <fa-flex-scroll-view fa-pipe-from="chat.ev" fa-pipe-to="chat.ev"  fa-options="chat.options.sv" id="chatSV" chat-scroll-view fa-start-index="chat.startIndex">
                    <fa-view ng-repeat="msg in chat.messages"  fa-index="1+$index">
                        <fa-modifier>
                            <fa-surface fa-pipe-to="chat.ev"  fa-size="[undefined, true]">
                                <div class="message-bubble" ng-class="{send : msg.isMyMessage}">
                                    <div class="back">
                                        <span class="author">{{::msg.fromId}}</span>
                                        <div class="time"></div>
                                        <div class="message">{{::msg.text}}</div>
                                    </div>
                                </div>
                            </fa-surface>
                        </fa-modifier>
                    </fa-view>
                </fa-flex-scroll-view>
            </fa-container-surface>

        </fa-modifier>

        <!-- FOOTER -->
        <fa-modifier>
            <fa-surface class="pe-full-height pe-tabbar pe-hairlined-top-border">
                <div style="padding:4px 20px 10px;height: 100%;display:-webkit-box;width:100%;">
                    <input ng-model="chat.newMessage" style="display:block;border:1px solid #eee;border-radius:2px;outline:none;height: 100%;-webkit-box-flex:1;margin-right:15px;">
                    <button ng-click="chat.addNewMessage()" style="width:40px;display: block;border:0;background:transparent;outline:none;"> Send </button>
                </div>

            </fa-surface>
        </fa-modifier>
    </fa-header-footer-layout>
</pele-screen>
