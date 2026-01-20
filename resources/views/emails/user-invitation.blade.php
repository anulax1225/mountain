<x-mail::message>
# Bienvenue sur {{ $appName }}

Vous avez été invité(e) à rejoindre **{{ $appName }}**, une plateforme de création de visites virtuelles en 360°.

Pour finaliser votre inscription et configurer votre mot de passe, cliquez sur le bouton ci-dessous :

<x-mail::button :url="$invitationUrl">
Finaliser mon inscription
</x-mail::button>

Ce lien d'invitation expirera dans 7 jours.

Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email.

Cordialement,<br>
L'équipe {{ $appName }}
</x-mail::message>
