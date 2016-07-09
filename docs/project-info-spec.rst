##########################
Project Info Specification
##########################

Spectrometer supports a PROJECT_INFO.yaml file placed in the root of a project
repo. This file is used by spectrometer to parse meta information about the
project including things like project description, project contact, committers
irc, mailing lists, release names, etc...

.. code-block:: yaml

    # This file is used by Spectrometer to determine project meta information
    # Please refer to the spec file located here:
    # https://opendaylight-spectrometer.readthedocs.io/en/latest/project-info-spec.html

    name: spectrometer
    display-name: Spectrometer
    creation-date: 2015-11-19
    termination-date: n/a
    description: |
        This is an example summary description of project

        After leaving a blank line in the description we can provide a longer
        more detailed description of the project.

        The details can be as many lines as necessary.
    primary-contact: Firstname Lastname <first.last@example.com>
    project-lead: Firstname Lastname <first.last@example.com>
    categories:
        - application
        - community
        - documentation
        - extensions
        - kernel
        - library
        - protocols
        - services
    committers:
        - Firstname Lastname <first.last@example.com>
        - Another Committer <another.committer@example.com>
    # When Committers who have made significant contributions to OpenDaylight
    # become inactive and thus no longer committers. This key can be used to
    # acknowledge their huge contributions by appointing them to Committer
    # Emeritus status.
    committers-emeritus:
        - Firstname Lastname <first.last@example.com>
    contributors:
        - Firstname Lastname <first.last@example.com>
        - Another Contributor <another.contributor@example.com>
    wiki: https://wiki.example.org/project
    irc: irc://irc.freenode.net/opendaylight-spectrometer
    mailing-lists:
        - email: spectrometer-dev@lists.opendaylight.org
          archives: http://lists.opendaylight.org/pipermail/spectrometer-dev/
        - email: spectrometer-users@lists.opendaylight.org
          archives: http://lists.opendaylight.org/pipermail/spectrometer-users/
    ci-server: https://jenkins.opendaylight.org
    issue-tracker: https://bugs.opendaylight.org
    static-analysis: https://sonar.opendaylight.org
    repository: https://git.opendaylight.org/gerrit/#/admin/projects/spectrometer
    meetings: |
        Free from text field for providing meeting information.
        It can be multiple lines long as necessary.
    releases:
        - helium
        - lithium
        - beryllium
        - boron

Required fields:

- name
- creation_date
- description
- primary_contact
- project_lead
