<pele-screen>
    <fa-header-footer-layout fa-options="{headerSize:main.viewSize.navbarHeight, footerSize : 0}">
        <fa-modifier>
            <pe-navbar>
                <div class="pe-navbar-button right" ng-click="home.goNext()">
                    left
                </div>

                <!-- TITLE -->
                <div class="pe-navbar-title">
                    Home
                </div>

                <!-- RIGHT -->
                <!--<div class="pe-navbar-button right"  >-->
                    <!--Next-->
                <!--</div>-->

            </pe-navbar>
        </fa-modifier>

        <fa-modifier>
            <fa-surface fa-background-color="'#efefef'">
                <!--<a href="/#/welcome"> welcome </a>-->
                <!--<a pe-back default-state="home" href="#"> back </a>-->
            </fa-surface>
        </fa-modifier>
    </fa-header-footer-layout>
</pele-screen>
