Feature: PPGIS Web Login

  Scenario: User can log in successfully
    Given I open the PPGIS web portal
    When I accept the SSL warning
    And I click Log In to your account
    And I accept the welcome popup
    And I enter my username and password
    Then I should be logged in successfully