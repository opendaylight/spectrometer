import pep8


def test_pep8_conformance():
    """Test that we conform to PEP8."""
    files_to_check = ['./spectrometer/githelpers.py',
                      './spectrometer/dashboard/views.py']
    pep8style = pep8.StyleGuide(quiet=True)
    result = pep8style.check_files(files_to_check)
    print(result.counters)
    if result.counters.get('E902', False):
        print('Could not find/open one of files')
    assert result.total_errors == 0
