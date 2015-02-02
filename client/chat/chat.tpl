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
            <fa-container-surface fa-options="{properties : {overflow : 'hidden', backgroundColor:'white'}}" >
                <fa-render-node fa-node="chat.scrollView"> </fa-render-node>
            </fa-container-surface>
        </fa-modifier>

        <!-- FOOTER -->
        <fa-modifier>
            <fa-input-surface></fa-input-surface>
        </fa-modifier>
    </fa-header-footer-layout>
</pele-screen>
