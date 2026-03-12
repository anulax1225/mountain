<?php

use Laravel\Dusk\Browser;

test('contact form renders correctly', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit('/contact')
            ->waitForText('Contactez-nous', 10)
            ->assertSee('Contactez-nous')
            ->assertSee('Envoyez-nous un message')
            ->assertPresent('input[id="name"]')
            ->assertPresent('input[id="email"]')
            ->assertPresent('input[id="phone"]')
            ->assertPresent('input[id="company"]')
            ->assertPresent('textarea[id="message"]');
    });
});

test('contact form submits successfully', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit('/contact')
            ->type('input[id="name"]', 'Jean Dupont')
            ->type('input[id="email"]', 'jean.dupont@exemple.fr')
            ->type('input[id="phone"]', '+33 6 12 34 56 78')
            ->type('input[id="company"]', 'Entreprise Test')
            ->type('textarea[id="message"]', 'Ceci est un message de test pour la visite virtuelle.')
            ->press('Envoyer le message')
            ->waitForText('Message envoyé avec succès')
            ->assertSee('Message envoyé avec succès');
    });
});

test('contact form shows validation errors for missing required fields', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit('/contact')
            // Submit without filling required fields
            ->press('Envoyer le message')
            ->pause(500)
            // HTML5 required validation prevents submission; name field should be focused
            ->assertPresent('input[id="name"]:invalid');
    });
});
