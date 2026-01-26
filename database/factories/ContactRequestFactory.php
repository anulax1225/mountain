<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ContactRequest>
 */
class ContactRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->optional(0.7)->phoneNumber(),
            'company' => fake()->optional(0.6)->company(),
            'message' => fake()->paragraphs(fake()->numberBetween(1, 3), true),
            'status' => 'received',
            'admin_notes' => null,
        ];
    }

    /**
     * Indicate that the contact request is received (new).
     */
    public function received(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'received',
            'admin_notes' => null,
        ]);
    }

    /**
     * Indicate that the contact request is in process.
     */
    public function inProcess(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'in_process',
            'admin_notes' => fake()->optional(0.5)->sentence(),
        ]);
    }

    /**
     * Indicate that the contact request is validated.
     */
    public function validated(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'validated',
            'admin_notes' => fake()->optional(0.7)->sentence(),
        ]);
    }

    /**
     * Indicate that the contact request is refused.
     */
    public function refused(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'refused',
            'admin_notes' => fake()->sentence(),
        ]);
    }

    /**
     * Set a random status.
     */
    public function randomStatus(): static
    {
        $statuses = ['received', 'in_process', 'validated', 'refused'];
        $status = fake()->randomElement($statuses);

        return $this->state(fn (array $attributes) => [
            'status' => $status,
            'admin_notes' => $status !== 'received' ? fake()->optional(0.6)->sentence() : null,
        ]);
    }

    /**
     * Create a contact request with a specific message type.
     */
    public function inquiry(): static
    {
        $inquiries = [
            "Bonjour, je souhaiterais obtenir plus d'informations sur vos services de visites virtuelles. Pouvez-vous me contacter pour en discuter ?",
            "Je suis intéressé par la création d'une visite virtuelle pour mon entreprise. Quels sont vos tarifs ?",
            "Nous cherchons une solution pour présenter nos locaux à distance. Vos services pourraient-ils nous convenir ?",
            "J'aimerais savoir si vous proposez des visites virtuelles pour les particuliers également.",
            "Pouvez-vous me faire parvenir un devis pour la réalisation d'une visite virtuelle de notre showroom ?",
        ];

        return $this->state(fn (array $attributes) => [
            'message' => fake()->randomElement($inquiries),
        ]);
    }

    /**
     * Create a contact request for a partnership proposal.
     */
    public function partnership(): static
    {
        $proposals = [
            "Bonjour, notre agence immobilière serait intéressée par un partenariat avec votre plateforme. Pouvons-nous en discuter ?",
            "Je représente une chaîne hôtelière et nous cherchons un prestataire pour créer des visites virtuelles de nos établissements.",
            "Nous sommes une agence de communication et souhaiterions proposer vos services à nos clients. Est-ce possible ?",
        ];

        return $this->state(fn (array $attributes) => [
            'message' => fake()->randomElement($proposals),
            'company' => fake()->company(),
        ]);
    }
}
