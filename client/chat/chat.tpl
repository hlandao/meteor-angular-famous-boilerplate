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
            <fa-container-surface fa-options="{properties : {overflow : 'hidden'}}" >
                <fa-scroll-view fa-pipe-from="conversations.scrollViewEventHandler" fa-options="{speedLimit : 1000}">
                    <fa-view ng-repeat="item in [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]">
                        <fa-modifier fa-size="[undefined, 75]">
                            <fa-surface class="pe-full-height pe-scrollview-offset-item-container" fa-pipe-to="conversations.scrollViewEventHandler">
                                <div class="pe-hairlined-bottom-border pe-scrollview-offset-item"></div>
                            </fa-surface>
                        </fa-modifier>
                    </fa-view>
                </fa-scroll-view>
            </fa-container-surface>
        </fa-modifier>

        <!-- FOOTER -->
        <fa-modifier>
            <fa-input-surface></fa-input-surface>
        </fa-modifier>
    </fa-header-footer-layout>
</pele-screen>
